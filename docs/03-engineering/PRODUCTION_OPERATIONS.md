# PRODUCTION OPERATIONS & ENGINEERING RUNBOOK

**NIRNAY Deployment, Storage, Email, Logging & Health Architecture**
*SIH26043 — Team CREATORZZZ*

---

## 1. Environment & Configuration Validation
On startup, NIRNAY validates critical configuration settings:
- `DATABASE_URL`: Bounded connection pool (`pool_pre_ping=True`, `pool_size=10`, `max_overflow=20`).
- `APP_ENV`: Controls strict storage/cookie validation.
- `STORAGE_PROVIDER`: Enforces `S3CompatibleStorageAdapter` in production; `LocalStorageAdapter` strictly rejected if `APP_ENV=production`.
- `EMAIL_PROVIDER`: Requires configured `SMTPEmailAdapter` in production.
- `CORS_ORIGINS`: Explicit domain origin list; wildcard `*` rejected in production.

---

## 2. Infrastructure Architecture
- **API Framework**: FastAPI / Python 3.11 with Alembic schema migrations (`001` through `012`).
- **Web Frontend**: Next.js 14 / TypeScript / Tailwind-free Vanilla CSS custom design system.
- **Database**: PostgreSQL 14+ with Alembic as authoritative schema manager.
- **Evidence Storage**: Provider-neutral S3-compatible adapter or Local Storage adapter (development).
- **Email Service**: Asynchronous background email adapter with provider failure handling.
- **Health Checks**:
  - `GET /health`: Core container status.
  - `GET /health/ready`: Deep health check verifying DB connectivity, Alembic schema state, and storage availability. Degraded AI state does not fail core readiness.
