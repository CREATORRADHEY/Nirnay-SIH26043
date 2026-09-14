#!/usr/bin/env bash
set -euo pipefail

# NIRNAY Production Database Backup Script
# Creates custom-format PostgreSQL dump with metadata manifest.

DB_URL="${DATABASE_URL:-postgresql://postgres:postgres@127.0.0.1:5432/nirnay}"
BACKUP_DIR="${BACKUP_DIR:-./storage/backups}"
TIMESTAMP=$(date -u +"%Y%m%dT%H%M%SZ")
APP_ENV="${APP_ENV:-production}"
BACKUP_FILE="${BACKUP_DIR}/nirnay_db_${APP_ENV}_${TIMESTAMP}.dump"
MANIFEST_FILE="${BACKUP_DIR}/nirnay_db_${APP_ENV}_${TIMESTAMP}.json"

mkdir -p "${BACKUP_DIR}"

echo "==> Starting NIRNAY Database Backup [${TIMESTAMP}]"
echo "Target File: ${BACKUP_FILE}"

# 1. Fetch current Alembic revision if alembic CLI available
ALEMBIC_REV="unknown"
if command -v alembic >/dev/null 2>&1; then
    ALEMBIC_REV=$(cd apps/api && alembic current 2>/dev/null | head -n1 || echo "unknown")
fi

# 2. Perform pg_dump in custom format
pg_dump "${DB_URL}" -F c -b -v -f "${BACKUP_FILE}"

# 3. Create backup manifest
cat << JSONEOF > "${MANIFEST_FILE}"
{
  "timestamp": "${TIMESTAMP}",
  "environment": "${APP_ENV}",
  "backup_file": "$(basename "${BACKUP_FILE}")",
  "alembic_revision": "${ALEMBIC_REV}",
  "file_size_bytes": $(stat -f%z "${BACKUP_FILE}" 2>/dev/null || stat -c%s "${BACKUP_FILE}" 2>/dev/null || echo 0)
}
JSONEOF

echo "==> Backup Complete."
echo "Dump: ${BACKUP_FILE}"
echo "Manifest: ${MANIFEST_FILE}"
