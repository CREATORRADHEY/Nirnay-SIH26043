# NIRNAY P5.4 — Jury Practical Evaluation Guide

**Project:** NIRNAY — Societal Innovation Collaboration & Readiness Platform  
**Problem Statement:** SIH26043  
**Team:** CREATORZZZ  
**Branch:** `feature/p5.4-jury-evaluation`  
**Workspace Route:** `/app/evaluation`  

---

## 1. Overview & Core Principle

> **CORE PRINCIPLE:**  
> DON'T ASK THE JURY TO TRUST THE CLAIM. LET THEM TEST THE CLAIM.

NIRNAY P5.4 provides a controlled internal evaluation workspace where Smart India Hackathon (SIH) jury members can independently evaluate the platform's core governance mechanisms:
1. **Routing Governance:** Routine municipal service issues are protected from becoming fake R&D projects.
2. **Institutional Commitment Separation:** Candidate matching is strictly separated from legally binding institutional commitments.
3. **Hero Dependency Invalidation:** Commitment changes automatically reopen stale readiness decisions while preserving audit history.
4. **Outcome Integrity:** Operational pilot completion is decoupled from evidence-based impact validation.

---

## 2. 30-Second Quick Setup

1. **Verify Canonical Repository & Branch:**
   ```bash
   cd /Users/divyanshdusad/Downloads/Nirnay-SIH26043
   git branch --show-current  # Expected: feature/p5.4-jury-evaluation
   ```

2. **Start Backend API & Frontend Services:**
   ```bash
   # Terminal 1: API Server
   cd apps/api && .venv/bin/uvicorn app.main:app --port 8000 --reload

   # Terminal 2: Next.js Frontend
   cd apps/web && npm run dev
   ```

3. **Open Evaluation Workspace in Browser:**
   Navigate to: `http://localhost:3000/app/evaluation`

---

## 3. Evaluation Workflows

### Option A: 3-Minute Quick Evaluation (Hero Path)

Focus on **Scenario 03 — DEPENDENCY INVALIDATION**:

1. Navigate to `/app/evaluation` and locate **Scenario 03 (Hero Scenario)**.
2. Click **Start Evaluation** to inspect the active challenge (`[SYNTHETIC] Solar Microgrid Storage Thermal Degradation`).
3. Note initial state: Commitment v1 is `ACCEPTED`, Readiness Decision v1 is `PILOT_READY`.
4. Click **Withdraw Commitment (HEI Action)** to submit Commitment v2 as `WITHDRAWN`.
5. Observe the instant governance rail action:
   * Previous `PILOT_READY` v1 remains preserved in version history.
   * `REVIEW_REQUIRED` is automatically appended as Readiness Decision v2.
6. Return to `/app/evaluation` and verify live checklist displays **PASS**.

---

### Option B: 8-Minute Full Evaluation (All 4 Scenarios)

#### Scenario 01: RIGHT PROBLEM (Routine Service Protection)
* **Action:** Open Scenario 01 (`[SYNTHETIC] Streetlight Transformer Fuse Outage`). Complete qualification workbench using the 5-question rubric. Select `SERVICE` route.
* **Proves:** Routine maintenance complaints are diverted to routine municipal execution. AI advisory is inspectable but cannot force an `INNOVATION_CHALLENGE` classification.

#### Scenario 02: REAL COMMITMENT (Candidate vs Commitment)
* **Action:** Open Scenario 02 (`[SYNTHETIC] Off-Grid Mahua Harvest Thermal Container`). Observe candidate status badge displaying `CANDIDATE MATCH — NOT A COMMITMENT`. Switch to HEI role and submit `ACCEPTED` commitment.
* **Proves:** Government candidate matching does not fabricate HEI acceptance. Status upgrades to `COMMITTED PARTNER` only upon explicit HEI sign-off.

#### Scenario 03: DEPENDENCY INVALIDATION (Hero Scenario)
* **Action:** Execute commitment withdrawal after `PILOT_READY`.
* **Proves:** Dependency integrity rail reopens stale readiness automatically without destroying historical audit records.

#### Scenario 04: COMPLETION IS NOT IMPACT (Outcome Integrity)
* **Action:** Open Scenario 04 (`[SYNTHETIC] Hazaribagh Vendor Cold Chain Storage Pilot`). Observe operational state is `COMPLETED`. Record evidence review conclusion as `INCONCLUSIVE`.
* **Proves:** Operational pilot completion does not generate automatic success claims. Dual states (`COMPLETED` + `INCONCLUSIVE`) persist simultaneously.

---

## 4. Decision Assurance & AI Boundary Testing

### 4.1 Decision Assurance Inspection
* Evaluators can inspect the **Decision Assurance Panel** on qualification screens.
* Demonstrates rubric scoring, human rationale requirements, and second-review triggers when human decision disagrees with AI non-binding advisory.

### 4.2 AI Assistance Toggle (Resilience Test)
* On `/app/evaluation`, click **AI ASSISTANCE: ON / OFF**.
* With AI **OFF**:
  * AI route suggestions display `Unavailable / Disabled`.
  * Core governance workflow displays `AVAILABLE & OPERATIONAL`.
  * Evaluator can complete manual qualification without system degradation.

---

## 5. Offline & Fallback Protocols

### Fallback 1: AI Provider / Network Unavailable
* The platform defaults to pure manual governance mode.
* Rubric evaluation, commitment recording, and readiness dependency rails continue operating locally via SQLite/PostgreSQL with zero API dependencies.

### Fallback 2: Local Isolated Standalone Execution
* Evaluation fixtures are completely deterministic and seeded via standard Alembic migrations.
* Scenario Reset (`POST /api/v1/evaluation/scenarios/{id}/reset`) re-seeds isolated synthetic records without requiring external cloud connectivity.

---

## 6. Claim Discipline & Safety Notice

* **Synthetic Data Labeling:** All records created in `/app/evaluation` are strictly labeled as `SYNTHETIC EVALUATION SCENARIO`.
* **Security & Auth:** Safe role switching uses server-side authorized evaluation identities and does not bypass PolicyService authorization rules or impersonate production users.
* **Non-Certification Notice:** Evaluation receipts generated at `/app/evaluation` certify controlled product testing results and do not constitute government operational accreditation.
