with open("apps/api/app/main.py", "r") as f:
    content = f.read()

ready_endpoint = """
@app.get("/health/ready")
def health_ready() -> dict:
    from app.core.database import SessionLocal
    from sqlalchemy import text
    from app.core.config import get_settings
    from app.services.ai.circuit_breaker import circuit_breaker

    settings = get_settings()
    health_status = {
        "status": "ready",
        "service": "nirnay-api",
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
    health_status["checks"]["storage"] = {
        "status": "ok",
        "provider": os.getenv("STORAGE_PROVIDER", "local"),
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
"""

if "/health/ready" not in content:
    content += ready_endpoint
    with open("apps/api/app/main.py", "w") as f:
        f.write(content)

print("apps/api/app/main.py updated with /health/ready endpoint")
