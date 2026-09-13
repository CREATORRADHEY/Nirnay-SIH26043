#!/usr/bin/env python3
"""
NIRNAY MVP RC1 — Automated Release Smoke Test Script

Verifies system health, API endpoints, scenario states, and optional live hero flow.
Usage:
    python scripts/smoke-release.py          # Standard smoke test (read-only verification)
    python scripts/smoke-release.py --hero   # Live scenario transitions + full pristine reset
"""

import sys
import argparse
import urllib.request
import urllib.error
import json
import subprocess
from pathlib import Path

BASE_URL = "http://localhost:8000"
WEB_URL = "http://localhost:3000"

SCENARIO_A_CHALLENGE_ID = "c0a80001-0000-4000-8000-000000000001"
SCENARIO_A_ORG_ID = "c0a80000-0000-4000-8000-000000000002"
SCENARIO_B_PILOT_ID = "b0a80002-0000-4000-8000-000000000006"
REVIEWER_ACTOR_ID = "d99c55a9-e4d4-42c1-abd1-5e9ccb2ad67c"


def http_get(url: str):
    req = urllib.request.Request(url, headers={"User-Agent": "NIRNAY-SmokeTest/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            return response.status, json.loads(response.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode()) if e.fp else {}
    except Exception as e:
        return 0, str(e)


def http_post(url: str, payload: dict):
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json", "User-Agent": "NIRNAY-SmokeTest/1.0"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            return response.status, json.loads(response.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode()) if e.fp else {}
    except Exception as e:
        return 0, str(e)


def reset_golden_demo():
    print("  [Reset] Running python scripts/seed_golden_demo.py --reset...")
    api_dir = Path(__file__).resolve().parent.parent / "apps" / "api"
    res = subprocess.run(
        [sys.executable, "scripts/seed_golden_demo.py", "--reset"],
        cwd=api_dir,
        capture_output=True,
        text=True,
    )
    if res.returncode != 0:
        print(f"  [FAIL] Seed reset failed: {res.stderr}")
        sys.exit(1)
    print("  [PASS] Seed reset successful.")


def run_smoke_test(hero_mode: bool = False):
    print("==================================================")
    print(f"NIRNAY MVP RC1 — RELEASE SMOKE TEST {'(HERO MODE)' if hero_mode else ''}")
    print("==================================================")

    # 1. Health check
    print("\n[1/6] Verifying Backend Health (/health)...")
    status, data = http_get(f"{BASE_URL}/health")
    if status == 200 and isinstance(data, dict) and data.get("status") == "ok":
        print(f"  [PASS] GET /health returned 200 OK ({data})")
    else:
        print(f"  [FAIL] GET /health returned status={status}, data={data}")
        sys.exit(1)

    # 2. Frontend /demo check
    print("\n[2/6] Verifying Frontend Demo Page (/demo)...")
    try:
        req = urllib.request.Request(f"{WEB_URL}/demo", headers={"User-Agent": "NIRNAY-SmokeTest/1.0"})
        with urllib.request.urlopen(req, timeout=5) as resp:
            if resp.status == 200:
                print(f"  [PASS] GET {WEB_URL}/demo returned 200 OK")
            else:
                print(f"  [WARN] GET {WEB_URL}/demo returned status={resp.status}")
    except Exception as e:
        print(f"  [WARN] Frontend server check at {WEB_URL}/demo bypassed ({e})")

    # 3. Scenario A Initial State
    print("\n[3/6] Verifying Scenario A (Ward 12 Waste Challenge)...")
    status, challenge = http_get(f"{BASE_URL}/api/v1/challenges/{SCENARIO_A_CHALLENGE_ID}")
    if status != 200:
        print(f"  [FAIL] Scenario A Challenge status={status}")
        sys.exit(1)

    status, readiness = http_get(f"{BASE_URL}/api/v1/challenges/{SCENARIO_A_CHALLENGE_ID}/readiness-decisions/latest")
    readiness_status = readiness.get("status") if isinstance(readiness, dict) else None
    if status != 200 or readiness_status != "PILOT_READY":
        print(f"  [FAIL] Scenario A initial readiness status is not PILOT_READY (status={status}): {readiness}")
        sys.exit(1)
    print(f"  [PASS] Scenario A Challenge exists, readiness_status = PILOT_READY (v{readiness.get('version')})")

    # 4. Scenario B Initial State
    print("\n[4/6] Verifying Scenario B (Cold Chain Pilot)...")
    status, pilot = http_get(f"{BASE_URL}/api/v1/pilots/{SCENARIO_B_PILOT_ID}")
    if status != 200:
        print(f"  [FAIL] Scenario B Pilot status={status}")
        sys.exit(1)

    status, op_state = http_get(f"{BASE_URL}/api/v1/pilots/{SCENARIO_B_PILOT_ID}/operational-states/latest")
    op_status = op_state.get("status") if isinstance(op_state, dict) else None
    if status != 200 or op_status != "ACTIVE":
        print(f"  [FAIL] Scenario B operational status is not ACTIVE (status={status}): {op_state}")
        sys.exit(1)

    status, evidence_plan = http_get(f"{BASE_URL}/api/v1/pilots/{SCENARIO_B_PILOT_ID}/evidence-plans/latest")
    if status != 200 or not evidence_plan.get("id"):
        print(f"  [FAIL] Scenario B missing Evidence Plan: {evidence_plan}")
        sys.exit(1)

    status, outcome = http_get(f"{BASE_URL}/api/v1/pilots/{SCENARIO_B_PILOT_ID}/outcomes/latest")
    if status != 404:
        print(f"  [FAIL] Scenario B initially has OutcomeAssessment when expected none: status={status}, outcome={outcome}")
        sys.exit(1)
    print("  [PASS] Scenario B Pilot exists, operational_status = ACTIVE, has Evidence Plan, zero initial OutcomeAssessment (404)")

    # 5. Optional Hero Transitions
    if hero_mode:
        print("\n[5/6] Executing Hero Scenario Transitions...")

        # Scenario A Transition: Withdraw commitment
        print("  Executing Scenario A: Withdrawing Commitment...")
        status, comm_resp = http_post(
            f"{BASE_URL}/api/v1/challenges/{SCENARIO_A_CHALLENGE_ID}/commitments",
            {
                "organization_id": SCENARIO_A_ORG_ID,
                "commitment_type": "FIELD_TESTING_SITE",
                "status": "WITHDRAWN",
                "scope_description": "Ward 12 Municipal Testing Facility",
                "rationale": "Smoke test automated withdrawal",
                "expected_version": 1,
                "recorded_by_actor_id": REVIEWER_ACTOR_ID,
            },
        )
        if status not in (200, 201):
            print(f"  [FAIL] Scenario A commitment withdrawal failed status={status}: {comm_resp}")
            sys.exit(1)

        # Check invalidated readiness
        status, new_readiness = http_get(f"{BASE_URL}/api/v1/challenges/{SCENARIO_A_CHALLENGE_ID}/readiness-decisions/latest")
        new_status = new_readiness.get("status") if isinstance(new_readiness, dict) else None
        if status != 200 or new_status != "REVIEW_REQUIRED":
            print(f"  [FAIL] Invalidation failed! Readiness status is {new_readiness}")
            sys.exit(1)
        print("  [PASS] Scenario A Readiness automatically invalidated to REVIEW_REQUIRED.")

        # Scenario B Transition: Complete pilot & record outcome
        print("  Executing Scenario B: Completing Pilot and Recording Outcome...")
        status, state_resp = http_post(
            f"{BASE_URL}/api/v1/pilots/{SCENARIO_B_PILOT_ID}/operational-states",
            {
                "status": "COMPLETED",
                "rationale": "Smoke test 60-day window complete",
                "expected_version": 2,
                "recorded_by_actor_id": REVIEWER_ACTOR_ID,
            },
        )
        if status not in (200, 201):
            print(f"  [FAIL] Scenario B state update failed status={status}: {state_resp}")
            sys.exit(1)

        status, outcome_resp = http_post(
            f"{BASE_URL}/api/v1/pilots/{SCENARIO_B_PILOT_ID}/outcomes",
            {
                "evidence_plan_id": evidence_plan.get("id"),
                "summary": "Observation window completed; baseline shift noted",
                "conclusion": "INCONCLUSIVE",
                "limitations": "Smoke test baseline variation limitation",
                "expected_version": 0,
                "assessed_by_actor_id": REVIEWER_ACTOR_ID,
            },
        )
        if status not in (200, 201):
            print(f"  [FAIL] Scenario B outcome creation failed status={status}: {outcome_resp}")
            sys.exit(1)
        print("  [PASS] Scenario B transition to COMPLETED + INCONCLUSIVE succeeded.")

        # Reset back to pristine
        print("  Resetting database back to pristine initial Golden state...")
        reset_golden_demo()
    else:
        print("\n[5/6] Hero Live Mode skipped (use --hero to execute scenario state transitions).")

    print("\n[6/6] Smoke Verification Result: CLEAN SUCCESS")
    print("==================================================")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="NIRNAY Release Smoke Test")
    parser.add_argument("--hero", action="store_true", help="Execute live scenario state transitions and reset to pristine")
    args = parser.parse_args()

    run_smoke_test(hero_mode=args.hero)
