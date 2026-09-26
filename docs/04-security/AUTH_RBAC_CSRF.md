# Auth, RBAC & Session Security — NIRNAY

## 1. Authentication Architecture

NIRNAY uses a session-based authentication scheme designed for secure municipal web applications:

```
[User Login Form] ──> POST /api/v1/auth/login ──> Verify Argon2id Hash ──> Create AuthSession ──> Set HttpOnly Cookie
```

### Password Policy & Hashing
- Algorithm: **Argon2id** via `argon2-cffi`.
- Minimum Password Length: 8 characters.
- Session Expiry: Server-configured rolling expiration.

---

## 2. Role-Based Access Control (RBAC)

RBAC enforcement occurs at both API routes (`FastAPI Dependencies`) and Frontend page layouts (`AppShell`).

### Role Hierarchy & Definitions
- `PLATFORM_ADMIN`: Global system oversight, audit logs, organization verification.
- `GOV_ADMIN` / `GOVERNMENT_NODAL`: Municipal qualification, readiness evaluation, pilot authorization.
- `HEI_ADMIN` / `HEI_FACULTY`: Academic matching, commitment acceptance, evidence plan creation.
- `INDUSTRY_ADMIN` / `INDUSTRY_MEMBER`: Industry partner commitments and co-funding tracking.
- `CITIZEN` / `INNOVATOR`: Challenge intake, evidence submission, public passport view.
- `JURY_EVALUATOR` / `AUDITOR`: Decision assurance checks, second reviews, scenario testing.

---

## 3. Session Isolation & Sign-Out Behavior

- **Explicit Server-Side Revocation**: Calling `POST /api/v1/auth/logout` immediately deletes the active `AuthSession` record from PostgreSQL and sets cookie expiration to the past.
- **Account Isolation**: Signing out completely clears local memory state (`useAuth` context) and `localStorage` user keys, preventing session bleeding when switching accounts on shared devices.
