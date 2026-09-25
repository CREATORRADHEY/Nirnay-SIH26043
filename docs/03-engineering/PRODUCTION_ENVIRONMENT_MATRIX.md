# NIRNAY — Production Environment Matrix

**Project:** NIRNAY — Societal Innovation Collaboration & Readiness Platform  
**Problem Statement:** SIH26043  
**Team:** CREATORZZZ  
**Branch:** `fix/production-deployment`  
**Base Commit:** `5cf1765738dadbc0af81fa79359497949481afc4`  
**Status:** RELEASE CANDIDATE TOPOLOGY LOCKED  

---

## Overview & Architecture Topology

NIRNAY uses a **Same-Origin API Proxy Architecture** for web deployments:

```
Browser (https://nirnay-sih-26043-one.vercel.app)
  │
  ├──► Static Pages & App Router (/app/*)
  │
  └──► Same-Origin Proxy Requests (/api/v1/*)
         │
         ▼ (Server-to-Server Next.js Rewrite)
       FastAPI Backend (https://nirnay-sih26043.onrender.com/api/v1/*)
```

By proxying browser requests `/api/v1/*` through Next.js rewrites on Vercel:
1. Browser session cookies (`nirnay_session`, `nirnay_csrf`) remain **same-origin** on `nirnay-sih-26043-one.vercel.app`.
2. Browser `SameSite=Lax` cookie policies work without requiring `SameSite=None` cross-site exemptions.
3. CORS headers are handled cleanly between Vercel server proxy and Render backend.

---

## Environment Variables Matrix (Name Reference Only — Zero Secrets)

### 1. VERCEL FRONTEND (`apps/web`)

| Variable Name | Required? | Secret? | Stage | Default / Description |
|---------------|-----------|---------|-------|-----------------------|
| `NEXT_PUBLIC_API_BASE_URL` | Optional | No | Build & Runtime | Set to `""` (empty string) for same-origin proxy, or `http://localhost:8000` for direct local development. |
| `INTERNAL_API_URL` | Optional | No | Runtime | Internal backend URL for Next.js server rewrites (e.g., `https://nirnay-sih26043.onrender.com`). |
| `NEXT_PUBLIC_ENABLE_DEMO_FALLBACK` | Required | No | Build & Runtime | Set to `"false"` in production. Enables client-side mock fallback when backend is offline in demo mode. |
| `NEXT_PUBLIC_DEMO_REVIEWER_ACTOR_ID` | Optional | No | Build & Runtime | Actor UUID used for default demo reviewer identity. |
| `NEXT_PUBLIC_RELEASE_SHA` | Optional | No | Build & Runtime | Release candidate commit SHA (`5cf1765738dadbc0af81fa79359497949481afc4`). |

---

### 2. RENDER BACKEND (`apps/api`)

| Variable Name | Required? | Secret? | Stage | Default / Description |
|---------------|-----------|---------|-------|-----------------------|
| `APP_ENV` | Required | No | Runtime | Set to `"production"` (or `"staging"`, `"development"`). |
| `APP_NAME` | Optional | No | Runtime | `nirnay-api` |
| `DEBUG` | Optional | No | Runtime | Set to `"false"` in production. |
| `DEMO_MODE` | Required | No | Runtime | Set to `"false"` in production (prohibited when `APP_ENV=production`). |
| `CORS_ORIGINS` | Required | No | Runtime | Comma-separated or JSON list of allowed origins (e.g. `https://nirnay-sih-26043-one.vercel.app,http://localhost:3000`). |
| `SESSION_COOKIE_SECURE` | Optional | No | Runtime | Auto-defaults to `true` when `APP_ENV=production`. |
| `SESSION_COOKIE_SAMESITE` | Optional | No | Runtime | Defaults to `"lax"` (for same-origin proxy), can be set to `"none"` if direct cross-origin is used. |
| `CSRF_COOKIE_SECURE` | Optional | No | Runtime | Auto-defaults to `true` when `APP_ENV=production`. |
| `CSRF_COOKIE_SAMESITE` | Optional | No | Runtime | Defaults to `"lax"`. |
| `NIRNAY_RELEASE_SHA` | Optional | No | Runtime | Exposed in `/health` telemetry response (`5cf1765738dadbc0af81fa79359497949481afc4`). |

---

### 3. DATABASE (POSTGRESQL)

| Variable Name | Required? | Secret? | Stage | Default / Description |
|---------------|-----------|---------|-------|-----------------------|
| `DATABASE_URL` | Required | Yes | Runtime | PostgreSQL connection URI (`postgresql+psycopg://user:pass@host:5432/dbname`). Automatically converted from `postgresql://` to `postgresql+psycopg://` if needed. |

---

### 4. OBJECT STORAGE (AWS S3 / GCP Cloud Storage / MinIO)

> [!IMPORTANT]
> MVP hosted demo currently uses explicitly configured ephemeral evidence storage (`STORAGE_PROVIDER=local`, `ALLOW_EPHEMERAL_STORAGE=true`). Durable S3-compatible object storage is required before production or field deployment.

| Variable Name | Required? | Secret? | Stage | Default / Description |
|---------------|-----------|---------|-------|-----------------------|
| `STORAGE_PROVIDER` | Required | No | Runtime | Set to `"s3"` for production, or `"local"` for MVP/development. |
| `ALLOW_EPHEMERAL_STORAGE` | Optional | No | Runtime | Set to `"true"` to explicitly authorize ephemeral local storage in hosted MVP demo environments. Defaults to `"false"` (fails closed when `APP_ENV=production` and `STORAGE_PROVIDER=local`). |
| `S3_BUCKET` | Required (for S3) | No | Runtime | S3 bucket name for challenge evidence attachments. |
| `S3_ENDPOINT_URL` | Optional | No | Runtime | Custom S3 endpoint URL (e.g. for MinIO / Cloudflare R2 / GCP Interop). |
| `S3_ACCESS_KEY_ID` | Required (for S3) | Yes | Runtime | IAM access key ID. |
| `S3_SECRET_ACCESS_KEY` | Required (for S3) | Yes | Runtime | IAM secret access key. |
| `S3_REGION` | Optional | No | Runtime | S3 region (defaults to `us-east-1`). |

---

### 5. AI SUBSYSTEM (OPTIONAL ADVISORY)

| Variable Name | Required? | Secret? | Stage | Default / Description |
|---------------|-----------|---------|-------|-----------------------|
| `AI_ENABLED` | Optional | No | Runtime | Set to `"true"` or `"false"`. Core governance workflow functions 100% when `"false"`. |
| `AI_PROVIDER` | Optional | No | Runtime | `"disabled"` or `"gemini"`. |
| `AI_MODEL` | Optional | No | Runtime | `"gemini-2.5-flash"`. |
| `AI_API_KEY` | Optional | Yes | Runtime | Gemini API key. If absent or invalid, circuit breaker trips safely to manual governance. |
| `AI_TIMEOUT_SECONDS` | Optional | No | Runtime | `15` seconds. |
