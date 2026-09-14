
# NIRNAY — Jury Demo Runbook (SIH26043)

This runbook guides a presenter through resetting, starting, and demonstrating NIRNAY's two core technical differentiators in under **3 minutes**.

---

## A. ONE-TIME SETUP

1. Clone repository & ensure python 3.11+ and Node.js 18+ are installed.
2. Install backend dependencies in `apps/api`:
   - cd apps/api
   - source .venv/bin/activate
   - pip install -r requirements.txt
3. Install frontend dependencies in `apps/web`:
   - cd apps/web
   - npm install

---

## B. RESET & SEED GOLDEN DEMO DATASET

Run the idempotent seed script with `--reset` before each demo session:

    cd apps/api
    source .venv/bin/activate
    python scripts/seed_golden_demo.py --reset

Output confirms deterministic UUIDs:
- Reviewer Actor: d99c55a9-e4d4-42c1-abd1-5e9ccb2ad67c
- Scenario A Challenge: c0a80001-0000-4000-8000-000000000001
- Scenario B Pilot: b0a80002-0000-4000-8000-000000000006

---

## C. START BACKEND API

    cd apps/api
    source .venv/bin/activate
    uvicorn app.main:app --reload --port 8000

---

## D. START FRONTEND WEB APPLICATION

    cd apps/web
    npm run dev

---

## E. REQUIRED FRONTEND ENVIRONMENT (.env.local)

    NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
    NEXT_PUBLIC_DEMO_REVIEWER_ACTOR_ID=d99c55a9-e4d4-42c1-abd1-5e9ccb2ad67c
    NEXT_PUBLIC_ENABLE_DEMO_FALLBACK=false

---

## F. LAUNCH PRESENTER DASHBOARD

Open: http://localhost:3000/demo

Check the DEMO READINESS panel:
- Backend API: Connected (Live)
- Reviewer Actor: Configured
- Scenario A & B: Ready

---

## G. SCENARIO A — DEPENDENCY INTEGRITY DEMO (~60 SECONDS)

1. Click Open Scenario A on `/demo`.
2. Click Pilot Readiness tab:
   - Highlight status is PILOT_READY v1.
   - Point out condition HEI_COMMITMENT is SATISFIED, depending on BIT Mesra Commitment v1 ACCEPTED.
3. Click Commitments tab:
   - Click Record Commitment Version.
   - Select Status: WITHDRAWN, enter rationale "Lab renovation prevents Ward 12 testing access".
   - Click Record Commitment Version.
4. Return to Pilot Readiness tab:
   - Point out status is automatically updated to REVIEW_REQUIRED v2.
5. Jury Key Point:
   "If a commitment that pilot readiness relied upon changes, NIRNAY preserves historical approvals for audit while automatically reopening readiness."

---

## H. SCENARIO B — EVIDENCE INTEGRITY DEMO (~75 SECONDS)

1. Click Open Scenario B on `/demo`.
2. Review Overview & Evidence Plan:
   - Current Operational State: ACTIVE v2.
   - Pre-declared Plan: Baseline 41%, Denominator 240 households.
3. Click Execution tab:
   - Click Update Operational State.
   - Advance to COMPLETED with rationale "60-day observation window finished".
4. Point out Separation:
   - Operational status is COMPLETED, but NO Outcome Assessment exists automatically.
5. Click Outcome tab:
   - Click Record Outcome Assessment.
   - Select Conclusion: INCONCLUSIVE.
   - Enter Limitation: "Denominator changed from 240 to 140 households during observation, making baseline uncomparable."
   - Save outcome assessment.
6. Jury Key Point:
   "Completed, but not proven. Execution completion is strictly separated from evidence validation."

---

## I. DEMO RECOVERY / RESET

If a demo step was performed live and you need to reset for another jury panel:

    cd apps/api
    source .venv/bin/activate
    python scripts/seed_golden_demo.py --reset

Refresh the browser window. The database will immediately return to initial golden demo state.

---

## J. OFFLINE DEMO FALLBACK POLICY

If network or database server is unavailable during demo:

In apps/web/.env.local:

    NEXT_PUBLIC_ENABLE_DEMO_FALLBACK=true
