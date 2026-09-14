# PLATFORM ADMIN WORKFLOWS & GOVERNANCE SPECIFICATION

**NIRNAY Platform Administration & System Governance**
*SIH26043 — Team CREATORZZZ*

---

## 1. Governance Architecture

The Platform Administration surface (`/app/admin`) is restricted exclusively to accounts with `platform_role = 'PLATFORM_ADMIN'`. All administrative endpoints are independently authorized on the server side by `require_platform_admin` guard middleware.

---

## 2. Core Workflows

### 2.1 Organization Approval & Lifecycle Management (`/app/admin/organizations`)
1. **PENDING Review**: Admin reviews newly registered Government, HEI, Industry, and Community organizations.
2. **Activation**: Admin validates credentials and promotes status `PENDING -> ACTIVE`. Security audit entry `ORG_ACTIVATED` is logged.
3. **Rejection**: Mandatory rationale required (`PENDING -> REJECTED`). Security audit entry `ORG_REJECTED` is logged.
4. **Suspension**: Admin suspends an organization for policy non-compliance (`ACTIVE -> SUSPENDED`) with explicit rationale. Security audit entry `ORG_SUSPENDED` is logged.
5. **Restoration**: Admin restores a suspended or rejected organization (`SUSPENDED -> ACTIVE`) with rationale.
6. **Data Retention Principle**: Organizations are NEVER deleted from the database to preserve historical evidence and domain trace integrity.

### 2.2 User & Membership Administration (`/app/admin/users`)
1. **Search & Inspection**: Search users by name, email, role, active status, or organization affiliation.
2. **Account Deactivation/Reactivation**: Admin can deactivate or reactivate user access.
3. **Role Modification**: Admin can update a user's `platform_role` with explicit security rationale.
4. **Last Admin Protection Invariant**: The system strictly prevents deactivating or demoting the last active `PLATFORM_ADMIN` account to guarantee system recoverability.
5. **Credential Safety**: Passwords cannot be edited directly; user password resets follow tokenized self-service flows.

### 2.3 System Audit Console (`/app/admin/audit`)
1. **Unified Audit Log**: Paginated view of `security_audit_logs`.
2. **Privacy Boundaries**: Passwords, session tokens, reset tokens, verification tokens, CSRF secrets, and AI API keys are strictly excluded from logging and UI display.
3. **Domain Trace Isolation**: Domain decision histories (qualification, commitments, pilot readiness) remain preserved in domain models and are not flattened into audit logs.

### 2.4 AI Operations & Telemetry (`/app/admin/ai`)
1. **Advisory Telemetry**: Displays AI module status, provider name, model, request counts, success/failure counts, average latency, circuit breaker state, and recent execution logs.
2. **Safety Boundaries**: AI has zero authority over domain decisions. Prompts and API keys are redacted.
