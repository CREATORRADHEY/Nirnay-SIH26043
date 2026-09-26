# Operations & Healthchecks — NIRNAY

## 1. Health & Readiness Endpoints

The API backend exposes dedicated endpoints for container orchestrators and automated monitoring tools:

### `GET /health`
- **Purpose**: System health check endpoint.
- **Verification**: Tests PostgreSQL database ping via SQLAlchemy `text("SELECT 1")`.
- **Response**:
```json
{
  "status": "healthy",
  "app_env": "production",
  "version": "sih26043-final-v1.1",
  "database": "connected"
}
```

---

## 2. Render Cold-Start Operational Warm-Up

> [!NOTE]  
> The free/starter deployment tier on Render spins down backend compute instances after 15 minutes of inactivity.

To ensure immediate responsiveness during live jury presentations, run the following warm-up command 60 seconds prior to starting a live demonstration:

```bash
curl -s -i https://nirnay-sih26043.onrender.com/health
```

Expected HTTP status: `200 OK`.
