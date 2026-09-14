# DATABASE BACKUP & RESTORE RUNBOOK

**NIRNAY PostgreSQL Disaster Recovery & Integrity Verification**
*SIH26043 — Team CREATORZZZ*

---

## 1. Backup Strategy
- **Format**: PostgreSQL custom format (`pg_dump -F c -b -v`).
- **Automation**: Executed via `./scripts/backup-db.sh`.
- **Manifest**: Generates structured JSON metadata manifest recording timestamp, environment, backup filename, Alembic revision, and byte size.
- **Git Safety**: Backup artifacts stored in `./storage/backups` (excluded by `.gitignore`).

---

## 2. Restore Procedure Runbook
1. **Declare Maintenance Window**: Notify stakeholders and suspend incoming web traffic.
2. **Verify Dump Integrity**: Run `pg_restore --list <dump-file>` to verify header integrity.
3. **Execute Restore**: Run `./scripts/restore-db.sh <dump-file> <target-db-url>`.
4. **Verify Schema State**: Confirm Alembic migration revision with `alembic current`.
5. **Verify System Health**: Call `GET /health/ready` to verify database connectivity.
6. **Smoke Test**: Execute `./scripts/test-backup-restore.sh`.
