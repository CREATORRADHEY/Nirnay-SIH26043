import os
import time
from collections import defaultdict
from fastapi import FastAPI, Request, Response, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_v1_router
from app.routers import auth, organizations, dashboard, notifications_router

app = FastAPI(
    title="NIRNAY API",
    description="Societal Innovation Collaboration & Readiness Platform API",
    version="2.4.0-RC1",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
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
]

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
    return {"status": "ok", "service": "nirnay-api"}
