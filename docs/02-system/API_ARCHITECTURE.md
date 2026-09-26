# API Architecture — NIRNAY

## 1. Overview & Endpoint Groups

The NIRNAY API is built with FastAPI and organized into versioned router modules under `/api/v1/`.

```
/api/v1/
  ├── auth/                 # Authentication, Login, Register, Session Me, Logout
  ├── challenges/           # Challenge submission, detail, evidence attachment
  ├── qualification/        # Qualification decisions, route assignment, history
  ├── hei-matching/         # HEI directory, capability search, candidate matching
  ├── commitments/          # Institutional commitment creation, acceptance, withdrawal
  ├── readiness/            # Readiness condition assessment, decision logic
  ├── pilots/               # Pilot operational lifecycle management
  ├── outcomes/             # Outcome assessment & evidence conclusion evaluation
  ├── decision-assurance/   # Audit receipts, second reviews, disagreement resolutions
  ├── ai-assistance/        # Bounded AI extraction, duplicate check, suggestions
  ├── ai-evaluation/        # LLM-as-judge benchmark evaluation runner
  ├── jury-evaluation/      # Hackathon jury simulation workspace & reset scenarios
  └── admin/                # Platform management, organization verification, audit logs
```

---

## 2. Core Endpoint Specifications

### A. Authentication & Session (`/api/v1/auth`)
- `POST /api/v1/auth/login`: Authenticate credentials, set HttpOnly session cookie, return user profile.
- `POST /api/v1/auth/logout`: Invalidate active session and clear browser cookies.
- `GET /api/v1/auth/me`: Retrieve current authenticated actor and organization role.

### B. Challenges & Evidence (`/api/v1/challenges`)
- `POST /api/v1/challenges`: Create a new societal challenge passport.
- `GET /api/v1/challenges`: List challenges with domain, district, and status filters.
- `GET /api/v1/challenges/{id}`: Retrieve full Challenge Passport details.
- `POST /api/v1/challenges/{id}/evidence`: Upload and attach evidence objects.

### C. Qualification (`/api/v1/qualification`)
- `POST /api/v1/qualification/decisions`: Submit a new versioned qualification decision (`SERVICE`, `CLARIFY`, `RESEARCH_REVIEW`, `INNOVATION_CHALLENGE`).
- `GET /api/v1/qualification/history/{challenge_id}`: Retrieve qualification version history.

### D. Commitments & Readiness (`/api/v1/commitments`, `/api/v1/readiness`)
- `POST /api/v1/commitments`: Issue or update an institutional commitment (`ACCEPTED`, `WITHDRAWN`). Enforces `expected_version` concurrency control.
- `POST /api/v1/readiness/conditions`: Add or update readiness condition status (`SATISFIED`, `UNSATISFIED`).
- `POST /api/v1/readiness/decisions`: Record overall readiness determination (`PILOT_READY`, `BLOCKED`, `REVIEW_REQUIRED`).

### E. Decision Assurance (`/api/v1/decision-assurance`)
- `POST /api/v1/decision-assurance/records`: Log human decision assurance receipt.
- `POST /api/v1/decision-assurance/second-reviews`: Submit independent second-reviewer verification.
- `GET /api/v1/decision-assurance/receipts/{decision_id}`: Fetch immutable audit receipt.

---

## 3. Standard Response & Error Format

All API errors return RFC 7807 compliant JSON problem details:

```json
{
  "detail": "Commitment version mismatch. Expected version 2, but found version 3.",
  "status_code": 409,
  "error_code": "COMMITMENT_CONCURRENCY_ERROR"
}
```
