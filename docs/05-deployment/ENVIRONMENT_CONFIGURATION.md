# Environment Configuration — NIRNAY

## 1. Environment Variables Reference

All environment configuration options are parsed via Pydantic `BaseSettings` in `apps/api/app/core/config.py`.

> [!IMPORTANT]
> Never document secret VALUES in repository documentation. Only variable names and acceptable structural default formats are specified below.

| Variable Name | Required | Default Format | Description |
| :--- | :---: | :--- | :--- |
| `APP_NAME` | No | `nirnay-api` | Identifier for backend application. |
| `APP_ENV` | Yes | `development` / `production` | Deployment mode. Production enforces strict fail-safes. |
| `DEBUG` | No | `false` | Enables detailed debug logs in non-production environments. |
| `DATABASE_URL` | Yes | `postgresql+psycopg://...` | PostgreSQL connection string using `psycopg3`. |
| `DEMO_MODE` | No | `false` in prod / `true` in dev | Controls availability of pre-seeded test endpoints. Must be `false` in production. |
| `CORS_ORIGINS` | Yes | `["https://nirnay-sih-26043-one.vercel.app"]` | Allowed origins for cross-origin CORS requests. |
| `SESSION_COOKIE_SECURE` | No | `true` in prod | Forces `Secure` attribute on session cookies. |
| `SESSION_COOKIE_SAMESITE` | No | `lax` | Configures `SameSite` policy on session cookies. |
| `STORAGE_PROVIDER` | No | `local` / `s3` | Storage adapter choice (`local` or `s3`). |
| `ALLOW_EPHEMERAL_STORAGE`| No | `false` in prod | Explicit opt-in for local ephemeral evidence storage in MVP mode. |
| `S3_BUCKET` | Optional | `nirnay-evidence` | S3 bucket name when `STORAGE_PROVIDER=s3`. |
| `AI_ENABLED` | No | `false` | Master toggle for Gemini AI assistance integration. |
| `AI_PROVIDER` | No | `disabled` / `gemini` | Active AI provider key. |
| `AI_MODEL` | No | `gemini-2.5-flash` | Selected LLM model name. |
| `AI_API_KEY` | Optional | `[SECRET]` | API key credential for Gemini API. |

---

## 2. Production Fail-Safes

In `app/core/config.py`, the `@model_validator` automatically enforces the following production invariants when `APP_ENV=production`:

1. `DEMO_MODE` cannot be set to `true` (raises `ValueError`).
2. `DATABASE_URL` cannot contain `localhost` or `127.0.0.1` (raises `ValueError`).
3. Cookies automatically default to `Secure=True`.
