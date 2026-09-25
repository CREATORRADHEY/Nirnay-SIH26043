import uuid
import os
import time
from collections import defaultdict
from fastapi import FastAPI, Request, Response, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_v1_router
from app.routers import auth, organizations, dashboard, notifications_router

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        from scripts.seed_golden_demo import seed_golden_demo_data
        seed_golden_demo_data(reset=False)
        print("--> Auto-seeded Golden Demo Data on Startup")
    except Exception as e:
        print(f"--> Auto-seed info: {e}")
    yield

app = FastAPI(
    title="NIRNAY API",
    description="Societal Innovation Collaboration & Readiness Platform API",
    version="2.4.0-RC1",
    lifespan=lifespan,
)

from app.core.config import get_settings

settings = get_settings()

allowed_origins = list(settings.cors_origins) if settings.cors_origins else [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://nirnay-sih-26043-one.vercel.app",
]
if "http://localhost:3000" not in allowed_origins:
    allowed_origins.append("http://localhost:3000")
if "http://127.0.0.1:3000" not in allowed_origins:
    allowed_origins.append("http://127.0.0.1:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

RATE_LIMIT_STORE = defaultdict(list)
RATE_LIMIT_WINDOW = 60
RATE_LIMIT_MAX_REQUESTS = 50

PUBLIC_AUTH_PATHS = [
    "/api/v1/auth/login",
    "/api/v1/auth/register",
    "/api/v1/auth/forgot-password",
    "/api/v1/auth/reset-password",
    "/api/v1/auth/verify-email",
    "/api/v1/auth/resend-verification",
    "/api/v1/auth/mobile-otp/send",
    "/api/v1/auth/mobile-otp/verify",
    "/api/v1/auth/logout",
]


@app.middleware("http")
async def request_correlation_id_middleware(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
    request.state.request_id = request_id
    start_time = time.time()

    response: Response = await call_next(request)
    duration_ms = round((time.time() - start_time) * 1000, 2)
    response.headers["X-Request-ID"] = request_id

    # Structured logging output (excluding sensitive content)
    path = request.url.path
    if not path.startswith("/_next") and not path.startswith("/static"):
        status_code = response.status_code
        print(f'{{"timestamp":"{time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())}","level":"INFO","request_id":"{request_id}","route":"{path}","method":"{request.method}","status_code":{status_code},"latency_ms":{duration_ms}}}')

    return response

@app.middleware("http")
async def security_and_csrf_middleware(request: Request, call_next):
    app_env = os.getenv("APP_ENV", "development").lower()
    if app_env == "production" and request.url.path.startswith("/demo"):
        return JSONResponse(status_code=404, content={"detail": "Not Found"})

    if request.url.path in PUBLIC_AUTH_PATHS:
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        RATE_LIMIT_STORE[client_ip] = [t for t in RATE_LIMIT_STORE[client_ip] if now - t < RATE_LIMIT_WINDOW]
        if len(RATE_LIMIT_STORE[client_ip]) >= RATE_LIMIT_MAX_REQUESTS:
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"detail": "Too many requests. Please try again later."},
            )
        RATE_LIMIT_STORE[client_ip].append(now)

    session_cookie = request.cookies.get("nirnay_session")
    if session_cookie and request.method in ["POST", "PUT", "PATCH", "DELETE"]:
        if request.url.path not in PUBLIC_AUTH_PATHS:
            csrf_cookie = request.cookies.get("nirnay_csrf")
            csrf_header = request.headers.get("X-CSRF-Token")
            if not csrf_cookie or not csrf_header or csrf_cookie != csrf_header:
                return JSONResponse(
                    status_code=status.HTTP_403_FORBIDDEN,
                    content={"detail": "CSRF token validation failed."},
                )

    response: Response = await call_next(request)

    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    response.headers["Content-Security-Policy"] = "default-src 'self'; frame-ancestors 'none';"

    return response


app.include_router(api_v1_router)
app.include_router(auth.router)
app.include_router(organizations.router)
app.include_router(dashboard.router)
app.include_router(notifications_router.router)


@app.get("/health")
def health() -> dict[str, str]:
    st = get_settings()
    return {
        "status": "ok",
        "service": "nirnay-api",
        "version": app.version,
        "release_sha": st.release_sha,
    }

@app.get("/health/ready")
def health_ready() -> dict:
    from app.core.database import SessionLocal
    from sqlalchemy import text
    from app.services.ai.circuit_breaker import ai_circuit_breaker as circuit_breaker

    st = get_settings()
    health_status = {
        "status": "ready",
        "service": "nirnay-api",
        "version": app.version,
        "release_sha": st.release_sha,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "checks": {},
    }

    # 1. Database Check
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        health_status["checks"]["database"] = {"status": "ok"}
    except Exception as e:
        health_status["status"] = "unhealthy"
        health_status["checks"]["database"] = {"status": "error", "message": "Database connection failed"}

    # 2. Storage Check
    st_provider = st.storage_provider.lower()
    app_env_val = st.app_env.lower()
    allow_ephemeral = st.allow_ephemeral_storage

    if st_provider == "s3" and st.s3_bucket:
        health_status["checks"]["storage"] = {
            "status": "ok",
            "provider": "s3",
            "durable": True,
            "mode": "PRODUCTION_DURABLE",
        }
    elif st_provider == "local":
        if app_env_val == "production" and not allow_ephemeral:
            health_status["status"] = "unhealthy"
            health_status["checks"]["storage"] = {
                "status": "error",
                "provider": "local",
                "durable": False,
                "mode": "PROHIBITED_LOCAL",
                "warning": "Ephemeral local storage is prohibited in production when ALLOW_EPHEMERAL_STORAGE=false.",
            }
        else:
            health_status["checks"]["storage"] = {
                "status": "ok",
                "provider": "local",
                "durable": False,
                "mode": "MVP_EPHEMERAL" if app_env_val == "production" else "DEVELOPMENT",
                "warning": "Evidence files may be lost after service restart or redeploy.",
            }
    else:
        health_status["checks"]["storage"] = {
            "status": "ok",
            "provider": st_provider,
            "durable": False,
            "mode": "UNKNOWN",
        }

    # 3. Email Check
    health_status["checks"]["email"] = {
        "status": "ok",
        "provider": os.getenv("EMAIL_PROVIDER", "console"),
    }

    # 4. AI Subsystem (Advisory - degraded does not make product unhealthy)
    health_status["checks"]["ai_subsystem"] = {
        "status": "ok" if settings.ai_enabled and circuit_breaker.get_state() == "CLOSED" else "degraded",
        "enabled": settings.ai_enabled,
        "circuit_breaker": circuit_breaker.get_state(),
    }

    if health_status["status"] != "ready":
        return JSONResponse(status_code=503, content=health_status)

    return health_status
