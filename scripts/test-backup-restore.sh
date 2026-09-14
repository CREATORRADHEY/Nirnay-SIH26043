#!/usr/bin/env bash
set -euo pipefail

# Automated Backup & Restore Verification Test
# Tests actual data recoverability by creating data, backing up, restoring, and verifying records.

echo "==> Running NIRNAY Backup & Restore Verification Test"

BACKUP_DIR="./storage/test_backups"
mkdir -p "${BACKUP_DIR}"

TEST_DB_NAME="nirnay_test_backup_db_$(date +%s)"
RESTORE_DB_NAME="nirnay_test_restore_db_$(date +%s)"
TEST_DB_URL="${DATABASE_URL:-postgresql://localhost:5432/${TEST_DB_NAME}}"
RESTORE_DB_URL="${DATABASE_URL:-postgresql://localhost:5432/${RESTORE_DB_NAME}}"

# Create test database and seed a sample record
createdb "${TEST_DB_NAME}" 2>/dev/null || true
psql "${TEST_DB_URL}" -c "CREATE TABLE backup_test_records (id INT PRIMARY KEY, val TEXT);" >/dev/null
psql "${TEST_DB_URL}" -c "INSERT INTO backup_test_records VALUES (1, 'nirnay_verifiable_record_p4b');" >/dev/null

# Execute backup
BACKUP_DIR="${BACKUP_DIR}" DATABASE_URL="${TEST_DB_URL}" APP_ENV="test" ./scripts/backup-db.sh >/dev/null

LATEST_DUMP=$(ls -t ${BACKUP_DIR}/*.dump | head -n1)

if [ -z "${LATEST_DUMP}" ]; then
    echo "FAILED: No dump file created."
    exit 1
fi

echo "==> Backup dump created: ${LATEST_DUMP}"

# Restore into second database
createdb "${RESTORE_DB_NAME}" 2>/dev/null || true
./scripts/restore-db.sh "${LATEST_DUMP}" "${RESTORE_DB_URL}" >/dev/null

# Verify data in restored database
RESTORED_VAL=$(psql "${RESTORE_DB_URL}" -t -A -c "SELECT val FROM backup_test_records WHERE id=1;")

if [ "${RESTORED_VAL}" != "nirnay_verifiable_record_p4b" ]; then
    echo "FAILED: Restored value '${RESTORED_VAL}' does not match expected."
    dropdb "${TEST_DB_NAME}" 2>/dev/null || true
    dropdb "${RESTORE_DB_NAME}" 2>/dev/null || true
    rm -rf "${BACKUP_DIR}"
    exit 1
fi

echo "==> Restored record verified: '${RESTORED_VAL}' matches expected payload."

# Cleanup test databases and dump
dropdb "${TEST_DB_NAME}" 2>/dev/null || true
dropdb "${RESTORE_DB_NAME}" 2>/dev/null || true
rm -rf "${BACKUP_DIR}"

echo "=================================================="
echo "NIRNAY BACKUP & RESTORE VERIFICATION TEST: PASSED"
echo "=================================================="
