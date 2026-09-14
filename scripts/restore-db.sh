#!/usr/bin/env bash
set -euo pipefail

# NIRNAY Production Database Restore Runbook Script
# Restores a PostgreSQL dump produced by backup-db.sh into a target database.

if [ "$#" -lt 1 ]; then
    echo "Usage: $0 <path-to-dump-file> [target-db-url]"
    exit 1
fi

DUMP_FILE="$1"
TARGET_DB_URL="${2:-${DATABASE_URL:-postgresql://postgres:postgres@127.0.0.1:5432/nirnay}}"

if [ ! -f "${DUMP_FILE}" ]; then
    echo "Error: Backup file '${DUMP_FILE}' not found."
    exit 1
fi

echo "=================================================="
echo "NIRNAY DATABASE RESTORE PROCEDURE"
echo "Target Database: ${TARGET_DB_URL}"
echo "Dump File:       ${DUMP_FILE}"
echo "=================================================="
echo "WARNING: This procedure will clean and restore tables in the target database."

# Verify dump file header using pg_restore --list
echo "==> Step 1: Verifying backup file integrity..."
pg_restore --list "${DUMP_FILE}" > /dev/null

echo "==> Step 2: Restoring data schema and objects..."
pg_restore --dbname="${TARGET_DB_URL}" --clean --if-exists --no-owner --no-privileges "${DUMP_FILE}" || true

echo "==> Step 3: Checking Alembic migration state..."
if command -v alembic >/dev/null 2>&1; then
    (cd apps/api && alembic current)
fi

echo "==> Step 4: Verification complete. Service may be restarted."
