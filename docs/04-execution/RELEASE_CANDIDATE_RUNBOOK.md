# NIRNAY MVP RC1 — Release Candidate & Dual-Mode Deployment Runbook

**Societal Innovation Collaboration & Readiness Platform (SIH26043)**
**Team CREATORZZZ**
**Release Label:** `NIRNAY MVP RC1`
**Status:** Feature-Frozen Release Candidate

---

## 1. RELEASE OVERVIEW & DUAL-MODE STRATEGY

NIRNAY is deployed in a **dual-mode architecture** to ensure 100% demo availability during Smart India Hackathon (SIH) jury evaluations:

- **MODE A — PRIMARY LOCAL SIH DEMO (Laptop Execution):**
  - PostgreSQL container + FastAPI backend server + Next.js web application.
  - Zero reliance on venue internet connectivity.
  - Idempotent reset script to restore initial state between jury panels in under 1 second.
- **MODE B — HOSTED BACKUP STAGING DEMO (Cloud Backup):**
  - Hosted containerized backend API with managed PostgreSQL.
  - Frontend pre-deployed to Vercel/cloud staging.
  - Bookmarked in browser as an instant fallback if local hardware experiences an issue.

---

## 2. DEPLOYMENT & ENVIRONMENT CLASSIFICATION

> [!IMPORTANT]
> **DEMO / STAGING CLASSIFICATION NOTICE**
> Authentication and RBAC are intentionally excluded from the Golden MVP scope to keep the technical evaluation focused strictly on NIRNAY's core state-invalidation and evidence-integrity differentiators.
>
> Therefore, all public endpoints are documented and deployed as **SIH DEMO / STAGING** environments, NOT as production government deployments.

---

## 3. ENVIRONMENT VARIABLE CONTRACT

All environment configuration is governed by `.env.example`. Secrets MUST NOT be committed to git.

### Backend Environment Variables (`apps/api/.env`)
| Variable | Description | Local Value | Staging/Hosted Value | Failsafe Rule |
| :--- | :--- | :--- | :--- | :--- |
| `APP_NAME` | Service Identifier | `nirnay-api` | `nirnay-api` | Standard |
| `APP_ENV` | Environment Tier | `development` / `staging` | `staging` / `production` | Prevents dev DB in prod |
| `DEBUG` | Debug Logging | `true` | `false` | Disabled in prod |
| `DATABASE_URL` | PostgreSQL Connection String | `postgresql+psycopg://postgres:postgres@127.0.0.1:5432/nirnay` | Managed DB connection string | Cannot be localhost in `production` |
| `DEMO_MODE` | Demo Seeds & Controls | `true` | `true` (staging only) | **Must be `false` if `APP_ENV=production`** |
| `CORS_ORIGINS` | Explicit Allowed Origins | `http://localhost:3000,http://127.0.0.1:3000` | `https://your-staging-frontend.vercel.app` | No `*` wildcards in staging/prod |

### Frontend Environment Variables (`apps/web/.env.local`)
| Variable | Description | Local Value | Hosted Value | Rule |
| :--- | :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_API_BASE_URL` | REST API Base URL | `http://localhost:8000` | `https://api-staging.yourdomain.com` | No trailing slash |
| `NEXT_PUBLIC_DEMO_REVIEWER_ACTOR_ID` | Canonical Reviewer UUID | `d99c55a9-e4d4-42c1-abd1-5e9ccb2ad67c` | `d99c55a9-e4d4-42c1-abd1-5e9ccb2ad67c` | Seeded reviewer account |
| `NEXT_PUBLIC_ENABLE_DEMO_FALLBACK` | Offline Emergency Fallback | `false` | `false` | **MUST default to `false`** |

---

## 4. DATABASE MIGRATION & SEED STRATEGY

NIRNAY uses strictly non-destructive Alembic migrations.

### Migration Rules
1. All schema creation is governed by Alembic (`alembic upgrade head`).
2. `Base.metadata.create_all()` is **PROHIBITED** in production/staging startup.
3. Locked schema revision head: `007_pilot_outcome_foundation`.
4. **NO NEW MIGRATION (008)** is created in the RC phase.

### Seeding Rules
1. Seed execution is **NEVER** coupled to container or application startup.
2. The Golden Demo dataset is seeded explicitly via:
   ```bash
   python scripts/seed_golden_demo.py --reset
   ```
3. Golden seed creates deterministic UUIDs for Scenario A (Ward 12 Waste Challenge) and Scenario B (Cold Chain Pilot Workspace).

---

## 5. LOCAL DEMO START & RESET PROCEDURE

### Step A: Initialize Local Stack
Run the automated initialization script:
```bash
./scripts/start-demo.sh
```

Or via Docker Compose:
```bash
docker-compose -f docker-compose.demo.yml up -d
```

### Step B: Reset Golden Demo (Between Jury Rehearsals / Panels)
To immediately restore the initial golden state before presenting to a new jury panel:
```bash
./scripts/demo-reset.sh
```
*Time taken: < 1 second.*

---

## 6. RELEASE SMOKE VERIFICATION

Before presenting to the jury, execute the automated release smoke test:

### Standard Smoke Check (Read-Only)
```bash
python scripts/smoke-release.py
```

Checks performed:
- Backend `GET /health` returns `200 OK`.
- Frontend `GET /demo` returns `200 OK`.
- Scenario A Challenge exists with readiness status `PILOT_READY`.
- Scenario B Pilot exists with operational state `ACTIVE`, pre-declared Evidence Plan, and 0 initial OutcomeAssessments.

### Hero Scenario Live Simulation Mode
```bash
python scripts/smoke-release.py --hero
```
Simulates live commitment withdrawal (readiness auto-invalidated to `REVIEW_REQUIRED`), pilot completion, and outcome assessment (`INCONCLUSIVE`), then resets the database back to pristine initial Golden state.

---

## 7. HOSTED STAGING DEPLOYMENT INSTRUCTIONS

For backup cloud deployment:

### Backend Deployment (Docker Container)
1. Build image using `apps/api/Dockerfile`:
   ```bash
   docker build -t nirnay-api:rc1 ./apps/api
   ```
2. Deploy to container host (e.g. Cloud Run, Render, Railway, AWS ECS).
3. Set environment variables (`APP_ENV=staging`, `DEMO_MODE=true`, `DATABASE_URL=<managed_db>`, `CORS_ORIGINS=https://your-frontend.vercel.app`).
4. Run migration task once: `alembic upgrade head`.
5. Run seed script once: `python scripts/seed_golden_demo.py --reset`.

### Frontend Deployment (Vercel / Cloud)
1. Deploy `apps/web` to Vercel or Node container host.
2. Configure build environment variables:
   - `NEXT_PUBLIC_API_BASE_URL=https://<your-api-domain>`
   - `NEXT_PUBLIC_DEMO_REVIEWER_ACTOR_ID=d99c55a9-e4d4-42c1-abd1-5e9ccb2ad67c`
   - `NEXT_PUBLIC_ENABLE_DEMO_FALLBACK=false`

---

## 8. DEMO LAPTOP CHECKLIST & VENUE PREPARATION

1. **Power:** Fully charge laptop battery and plug in AC adapter.
2. **Local Stack:** Start Postgres, API, and Web server. Run `./scripts/demo-reset.sh`.
3. **Browser Setup:**
   - Primary tab: `http://localhost:3000/demo`
   - Backup tab: Bookmarked hosted staging URL.
4. **OS Settings:** Enable "Do Not Disturb" / Disable all desktop notifications.
5. **Display:** Test HDMI/USB-C projector resolution output (1920x1080 recommended).

---

## 9. FAILURE RECOVERY MATRIX

| Issue / Failure | Root Cause | Immediate Action |
| :--- | :--- | :--- |
| Frontend shows "API Disconnected" | Backend server down or incorrect URL | Check `./scripts/smoke-release.py`, verify `NEXT_PUBLIC_API_BASE_URL`. |
| CORS Error in browser console | Origin not listed in backend `CORS_ORIGINS` | Add frontend origin to `CORS_ORIGINS` in backend environment and restart API. |
| Database connection error | PostgreSQL container down or port 5432 blocked | Run `docker-compose -f docker-compose.demo.yml restart postgres`. |
| Scenario data mutated during demo | Jury presentation modified state | Run `./scripts/demo-reset.sh` to restore initial state instantly. |
| Venue Wi-Fi dropped / offline | Network interruption | Switch fully to local primary laptop stack (`http://localhost:3000`). |
| Local laptop hardware crash | Local machine failure | Open bookmarked hosted staging backup URL on backup device. |

---

## 10. EMERGENCY OFFLINE FALLBACK POLICY

If BOTH local database and hosted cloud API fail during venue emergencies:

Set in `apps/web/.env.local`:
```env
NEXT_PUBLIC_ENABLE_DEMO_FALLBACK=true
```

The frontend will use in-memory deterministic fallback datasets with explicit **`DEMO FALLBACK`** badges displayed across all screens to maintain full transparent jury presentation capability.
