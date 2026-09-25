# NIRNAY

**Societal Innovation Collaboration & Readiness Platform**

Smart India Hackathon 2026  
Problem Statement: SIH26043  
Team: CREATORZZZ

**Tagline**:  
*Right Problem. Ready Pilot. Proven Outcome.*

---

## 1. What NIRNAY Is

NIRNAY is a production-oriented public-sector governance and readiness platform built for SIH26043. It transforms unstructured municipal and field problem statements into standardized **Challenge Passports**, matches academic research capabilities (HEIs) and MSME solutions, and manages pilot readiness and outcome evaluation through deterministic state transitions.

### Core Architectural Principles:

1. **Facts ≠ Decisions ≠ Readiness ≠ Outcomes**:
   Operational pilot completion is kept strictly separate from evidence outcome evaluation. A completed pilot does not automatically equal proven impact.
2. **AI is Strictly Advisory**:
   Artificial Intelligence operates exclusively as a non-authoritative advisory assistant (`is_ai_advisory: true`). All domain decisions are executed by authenticated human actors.
3. **Deterministic State Transitions**:
   State transitions are governed by formal domain contracts and optimistic concurrency control (`expected_version`).
4. **Dependency-Aware Readiness**:
   If an underlying institutional commitment is withdrawn, NIRNAY preserves historical audit logs but automatically invalidates pilot readiness (`PILOT_READY` ➔ `REVIEW_REQUIRED`).

---

## 2. System Architecture & Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4.
- **Backend API**: FastAPI (Python 3.11/3.13), Pydantic v2, SQLAlchemy 2.0 ORM.
- **Database**: PostgreSQL (Supabase / Render) with Alembic migration version control.
- **Authentication & Security**: Account-based authentication, salted PBKDF2 password hashing, opaque session token hashes (`token_hash`), CSRF headers, and server-side RBAC middleware (`PolicyService`).

---

## 3. Monorepo Layout

```text
Nirnay-SIH26043/
├── apps/
│   ├── web/                          # Next.js Frontend App
│   │   ├── src/app/                  # App Router pages (public, auth, & authenticated /app)
│   │   ├── src/components/           # UI Components (Shell, Passports, Readiness, Pilots)
│   │   ├── src/lib/                  # Auth Context & Typed API client
│   │   └── test/                     # Frontend ESM Test Suite (28 tests)
│   └── api/                          # FastAPI Backend App
│       ├── alembic/                  # Schema migration history
│       ├── app/                      # Models, routers, services, & policy matrix
│       └── scripts/                  # Seed scripts for demonstration data
├── packages/
│   └── contracts/                    # Canonical domain state contracts (JSON)
├── docs/                             # Engineering, architecture, & audit documentation
└── scripts/                          # Parity & setup scripts
```

---

## 4. Prerequisites & Setup

- **Node.js**: 20+
- **Python**: 3.11+
- **Database**: PostgreSQL 15+

### Running Frontend:

```bash
cd apps/web
npm install
npm run dev
```

Verification scripts:

```bash
npm test          # Runs 28 unit and governance tests
npm run typecheck # TypeScript compilation check
npm run lint      # ESLint static analysis
npm run build     # Production Next.js build check
```

### Running Backend:

```bash
cd apps/api
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Verification scripts:

```bash
pytest            # Runs 143 backend domain and API tests
```

---

## 5. Important Prototype & Evaluation Disclaimer

NIRNAY is a production-oriented MVP developed for Smart India Hackathon evaluation. Demonstration dataset records (e.g. Ranchi Urban Waste, Hazaribagh Vendor Pilot) represent synthetic evaluation scenarios and must not be interpreted as real Government of Jharkhand data, official endorsement, or measured real-world public deployment.
