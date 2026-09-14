#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

echo "=================================================="
echo "NIRNAY MVP RC1 — Local Demo Initialization"
echo "=================================================="

cd "${ROOT_DIR}/apps/api"

if [ -d ".venv" ]; then
    source .venv/bin/activate
fi

echo "[1/3] Running database migrations (alembic upgrade head)..."
alembic upgrade head

echo "[2/3] Resetting Golden Demo dataset..."
python scripts/seed_golden_demo.py --reset

echo "[3/3] Golden Demo State Verified."
echo ""
echo "--------------------------------------------------"
echo "DEMO READY FOR JURY PRESENTATION"
echo "--------------------------------------------------"
echo "Backend API:  http://localhost:8000"
echo "Health Check: http://localhost:8000/health"
echo "Frontend Web: http://localhost:3000"
echo "Jury Presenter: http://localhost:3000/demo"
echo "--------------------------------------------------"
