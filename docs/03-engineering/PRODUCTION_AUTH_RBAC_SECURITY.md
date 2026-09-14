# NIRNAY Production Authentication & Security Architecture (P1 Security Closed)

## 1. Password Hashing Engine
- **Algorithm**: Argon2id (`argon2_cffi`) with secure parameters.
- **Salt**: 16-byte random salt generated per hash by Argon2id implementation.
- **Verification**: Constant-time verification through Argon2 C bindings (`ph.verify`).
- **Legacy Hash Support**: Transparent rehash mechanism for legacy PBKDF2 hashes on successful authentication.
- **Secrecy**: Password hashes are strictly excluded from API response schemas.

## 2. Session Architecture & Cookie Security
- **Opaque Tokens**: Cryptographically secure 32-byte hex tokens generated using `secrets.token_hex(32)`.
- **Database Storage**: Only the SHA-256 hash of the session token (`token_hash`) is stored in `auth_sessions`.
- **Cookie Security**:
  - `HttpOnly`: `True` (prevents XSS access).
  - `SameSite`: `Lax` (prevents cross-site token leakage).
  - `Path`: `/`
  - Expiration: 30 days (`max_age = 2,592,000`).
- **Logout & Revocation**: Server-side session revocation sets `revoked_at`. Expired/revoked sessions return 401 Unauthorized.

## 3. CSRF Protection
- **Mechanism**: Double-submit cookie + custom header verification (`X-CSRF-Token`).
- **Scope**: Enforced on all unsafe HTTP methods (`POST`, `PUT`, `PATCH`, `DELETE`).
- **Exemptions**: Public authentication entry points (`/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`, `/resend-verification`).
- **Violation Action**: Returns HTTP 403 Forbidden.

## 4. Email Verification & Password Reset Lifecycle
- **Tokens**: Hashed 32-byte tokens with 24-hour expiration (`email_verification_tokens`, `password_reset_tokens`).
- **Replay Protection**: Single-use tokens marked `used_at` upon consumption.
- **Enumeration Safety**: `/forgot-password` and `/resend-verification` return identical success responses regardless of whether the email exists.
- **Session Revocation on Reset**: Successful password reset revokes all active user sessions across all devices.

## 5. Session Management
- `GET /api/v1/auth/sessions`: List active non-expired sessions.
- `DELETE /api/v1/auth/sessions/{session_id}`: Revoke a specific session.
- `POST /api/v1/auth/sessions/revoke-others`: Revoke all other active sessions for current user.
- **Frontend Management**: `/app/account/security` provides full UI visibility and session control.

## 6. Fine-Grained Role-Based Access Control (RBAC)
Supported 9 Platform Roles:
1. `COMMUNITY_REPORTER`
2. `GOVERNMENT_REVIEWER`
3. `GOVERNMENT_ADMIN`
4. `HEI_MEMBER`
5. `HEI_REVIEWER`
6. `HEI_ADMIN`
7. `INDUSTRY_MEMBER`
8. `INDUSTRY_ADMIN`
9. `PLATFORM_ADMIN`

## 7. Organization Lifecycle & Inviter Authority Boundaries
- **Organization Categories**: `GOVERNMENT`, `HEI`, `INDUSTRY`, `MSME`, `RESEARCH_ORGANIZATION`, `CIVIL_SOCIETY`, `COMMUNITY`.
- **Status Lifecycle**: `PENDING`, `ACTIVE`, `REJECTED`, `SUSPENDED`.
- **Onboarding Boundary**: Self-created organizations start as `PENDING` and cannot execute privileged institutional actions until approved by a Platform Administrator (`/api/v1/organizations/{id}/activate`).
- **Inviter Scope Boundaries**:
  - `HEI_ADMIN` can only grant `HEI_MEMBER` or `HEI_REVIEWER`.
  - `INDUSTRY_ADMIN` can only grant `INDUSTRY_MEMBER`.
  - Institutional admins cannot grant `GOVERNMENT_ADMIN` or `PLATFORM_ADMIN`.

## 8. Canonical Authorization Matrix (`PolicyService`)
- `challenge:create`
- `challenge:view_own`
- `challenge:view_review_scope`
- `challenge:add_evidence`
- `qualification:record`
- `hei_candidate:create`
- `organization:manage`
- `organization:invite`
- `commitment:record_own_org`
- `readiness:assess`
- `readiness:authorize`
- `pilot:create`
- `outcome:assess`
- `platform:admin`

## 9. Workflow API Refactoring & IDOR Defenses
- All mutation endpoints (`/qualification-decisions`, `/commitments`, `/readiness-conditions`, `/readiness-decisions`, `/pilots`, `/operational-states`, `/evidence-plans`, `/outcomes`) derive acting actor identity from the authenticated session (`get_current_actor`), eliminating reliance on client-supplied actor IDs.
- Institutional boundary checks prevent cross-tenant mutations (e.g. HEI A recording commitments on behalf of HEI B).

## 10. Rate Limiting & Security Headers
- **Rate Limiter**: Sliding-window rate limiter for auth endpoints returning HTTP 429 Too Many Requests.
- **Security Headers**:
  - `X-Content-Type-Options`: `nosniff`
  - `X-Frame-Options`: `DENY`
  - `Referrer-Policy`: `strict-origin-when-cross-origin`
  - `Permissions-Policy`: `camera=(), microphone=(), geolocation=()`
  - `Content-Security-Policy`: `default-src 'self'; frame-ancestors 'none';`

## 11. Security Audit Event Logging
Audit events recorded in `security_audit_logs`:
- `LOGIN_SUCCESS`
- `LOGIN_FAILURE`
- `LOGOUT`
- `PASSWORD_CHANGED`
- `PASSWORD_RESET`
- `SESSION_REVOKED`
- `EMAIL_VERIFIED`
- `MEMBERSHIP_ROLE_CHANGED`
- `ORGANIZATION_STATUS_CHANGED`

## 12. `/demo` Production Isolation
- When `APP_ENV=production`, access to `/demo` is blocked with HTTP 404 Not Found.
