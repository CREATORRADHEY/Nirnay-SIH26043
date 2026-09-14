# SECURITY OPERATIONS RUNBOOK

**NIRNAY Incident Containment, Secret Rotation & Account Security**
*SIH26043 — Team CREATORZZZ*

---

## 1. Account & Credential Security
- **Argon2id Hashing**: Password storage using Argon2id with salt.
- **Session Revocation**: Database-backed sessions allowing global revocation of compromised sessions.
- **Last Admin Invariant**: Protection mechanism preventing deactivation/demotion of the final active `PLATFORM_ADMIN`.

---

## 2. Incident Response Procedures
1. **Compromised Account / Session**: Deactivate user account via `/app/admin/users` or revoke active sessions in database.
2. **Organization Suspension**: Suspend compromised institution via `/app/admin/organizations` with audit rationale.
3. **Secret Rotation**: Update `SESSION_SECRET`, `AI_API_KEY`, or `STORAGE_SECRET_KEY` in environment config and restart API instances.
4. **Audit Review**: Inspect `/app/admin/audit` filtered by actor ID or event type.
