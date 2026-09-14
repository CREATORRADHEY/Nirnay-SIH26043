#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

echo "=================================================="
echo "NIRNAY — Golden Demo Dataset Seed"
echo "=================================================="

cd "${ROOT_DIR}/apps/api"

if [ -d ".venv" ]; then
    source .venv/bin/activate
fi

python scripts/seed_golden_demo.py "$@"

echo "[PASS] Golden Demo dataset seeded successfully."
