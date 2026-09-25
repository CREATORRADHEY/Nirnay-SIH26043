# NIRNAY P5.1 — Canonical Product Journey Demonstration Guide

**Project:** NIRNAY — Societal Innovation Collaboration & Readiness Platform  
**Problem Statement:** SIH26043  
**Team:** CREATORZZZ  
**Branch:** `feature/p5.1-product-workflow`  

---

## Overview

This document specifies the exact step-by-step canonical product demonstration flow for evaluating NIRNAY P5.1 end-to-end. One single persisted challenge record travels across all roles and stages without manual database manipulation or synthetic frontend mocks.

---

## Canonical Journey Acts

### ACT 1 — Citizen: Report Societal Challenge & Evidence Submission

- **Role:** Citizen / Community Reporter (`COMMUNITY_REPORTER`)
- **Credentials:** Citizen Account (`citizen@nirnay.gov.in` / OTP Login)
- **URL:** `http://localhost:3000/app/challenges/new`
- **Action:**
  1. Fill in 5-step wizard: Title ("Contaminated Groundwater in Hatia Ward 14"), Domain (`WATER`), District (`Ranchi`), Description, and Context.
  2. Attach supporting evidence document (`ranchi-water-survey-2026.pdf`).
  3. Click **Submit Challenge**.
- **Expected Backend State:**
  - New row inserted into PostgreSQL `challenges` table with `lifecycle_stage = SUBMITTED` and canonical `id`.
  - Evidence row inserted into `evidence` table linked to `challenge_id`.
- **Expected Visible UI State:**
  - Immediate redirect to `/app/challenges/[challengeId]` (Challenge Passport).
  - Passport header displays `Title`, `Location`, `Domain`, `Source: CITIZEN`.
  - Lifecycle rail highlights `Step 1: REPORTED (● Current)`.
  - Universal header displays `Current State: REPORTED`.

---

### ACT 2 — Government Reviewer: Intake & Qualification Decision

- **Role:** Government Reviewer / State Nodal Officer (`GOVERNMENT_REVIEWER` / `GOVERNMENT_ADMIN`)
- **Credentials:** Government Reviewer Account (`reviewer@nirnay.gov.in`)
- **URL:** `http://localhost:3000/app/review/[challengeId]`
- **Action:**
  1. Inspect citizen submission narrative and attached evidence.
  2. Record optional clarification query if additional facts needed.
  3. Record qualification decision: Route = `INNOVATION_CHALLENGE`, Rationale = "Qualified for state-supported pilot testing under Urban Waste Initiative."
  4. Click **Record Qualification Decision**.
- **Expected Backend State:**
  - `qualification_decisions` table appends `version = 1`, `route = INNOVATION_CHALLENGE`, `decided_by_actor_id = reviewer_id`.
- **Expected Visible UI State:**
  - Confirmation message: `✓ Qualification decision recorded`.
  - Passport updates Lifecycle rail to `Step 2: QUALIFIED`.
  - Universal header displays `Current State: INNOVATION_CHALLENGE`.

---

### ACT 3 — HEI Matching & Institutional Commitment

- **Role 1 (Government):** Shortlist Candidate Institution
  - **URL:** `http://localhost:3000/app/hei-matching?challenge_id=[challengeId]`
  - **Action:** Select "Birla Institute of Technology, Mesra", Rationale = "Matched based on hydro-geological aquifer lab facilities", click **Add Candidate Match**.
  - **Backend State:** Row inserted into `challenge_hei_candidates`. `CANDIDATE` is explicitly distinguished from committed partner.
- **Role 2 (HEI Admin):** Record Binding Commitment
  - **Role:** HEI Admin (`HEI_ADMIN`)
  - **Credentials:** HEI Account (`hei.admin@bitmesra.ac.in`)
  - **URL:** `http://localhost:3000/app/commitments?challenge_id=[challengeId]`
  - **Action:** Record commitment version v1: Type = `TECHNICAL_FACILITY_ACCESS`, Status = `ACCEPTED`, Scope = "Hydro-geological lab testing and faculty lead committed."
  - **Expected Backend State:** `commitments` table appends `version = 1`, `status = ACCEPTED`.
  - **Expected Visible UI State:** Passport displays `Step 4: COMMITTED (v1 ACCEPTED)`.

---

### ACT 4 — Government Pilot Readiness Authorization

- **Role:** Government Reviewer / State Nodal Officer (`GOVERNMENT_REVIEWER`)
- **URL:** `http://localhost:3000/app/readiness?challenge_id=[challengeId]`
- **Action:**
  1. Inspect readiness conditions matrix (Environmental clearance, field access permit, institutional commitment).
  2. Select Status = `PILOT_READY`, Rationale = "All safety clearances and institutional commitments satisfied."
  3. Click **Grant Readiness Authorization**.
- **Expected Backend State:**
  - `readiness_decisions` table appends `version = 1`, `status = PILOT_READY`, `decided_by_actor_id = reviewer_id`.
- **Expected Visible UI State:**
  - Confirmation message: `✓ Pilot readiness authorized! State becomes PILOT_READY v1`.
  - Passport rail highlights `Step 5: PILOT READINESS`.

---

### ACT 5 — Hero Dependency Invalidation Flow

- **Role:** HEI Admin (`HEI_ADMIN`)
- **URL:** `http://localhost:3000/app/commitments?challenge_id=[challengeId]`
- **Action:**
  1. Click **Update Version** on the existing commitment series (`TECHNICAL_FACILITY_ACCESS`).
  2. Set Status = `WITHDRAWN`, Rationale = "Faculty lead unavailable due to conflicting academic term."
  3. Click **Commit New Version**.
- **Expected Backend Behavior:**
  - `commitments` table appends `version = 2`, `status = WITHDRAWN`.
  - Backend transaction automatically triggers `invalidate_readiness_for_commitment_change()`.
  - `readiness_decisions` table appends `version = 2`, `status = REVIEW_REQUIRED`, `triggered_by_commitment_id = commitment_v2_id`. Old `PILOT_READY v1` remains untouched in PostgreSQL history.
- **Expected Visible UI State:**
  - Navigating to `/app/readiness` or `/app/challenges/[challengeId]` immediately shows:
    - **Current State:** `REVIEW_REQUIRED`
    - **Previous:** `PILOT_READY v1`
    - **Trigger:** `Commitment updated to WITHDRAWN`
  - Re-evaluating readiness allows authorized human to grant `PILOT_READY v2` once resolved.

---

### ACT 6 — Pilot Execution Workflow

- **Role:** Government Reviewer / Ground Administrator (`GOVERNMENT_REVIEWER`)
- **URL:** `http://localhost:3000/app/pilots?challenge_id=[challengeId]`
- **Action:**
  1. Initialize pilot from `PILOT_READY` challenge.
  2. Advance operational status: `PLANNED` → `ACTIVE` → `COMPLETED`.
- **Expected Backend State:**
  - `pilots` table inserted. `pilot_operational_states` table appends versioned operational transitions.
- **Expected Visible UI State:**
  - Pilot status badge shows `COMPLETED`.
  - Operational completion does NOT automatically mark outcome as validated or successful.

---

### ACT 7 — Factual Outcome Assessment

- **Role:** Government Reviewer (`GOVERNMENT_REVIEWER`)
- **URL:** `http://localhost:3000/app/outcomes?pilot_id=[pilotId]`
- **Action:**
  1. Inspect pilot evidence plan and collection telemetry.
  2. Record outcome assessment: Conclusion = `INCONCLUSIVE`, Rationale = "Monsoon weather variations reduced solar efficiency during weeks 3-4, requiring extended sample size."
  3. Click **Record Outcome Assessment**.
- **Expected Backend State:**
  - `outcome_assessments` table appends `version = 1`, `conclusion = INCONCLUSIVE`.
- **Expected Visible UI State:**
  - Page displays decoupled integrity status:
    - **Operational Status:** `COMPLETED`
    - **Evidence Conclusion:** `INCONCLUSIVE`
  - Both statuses remain simultaneously visible.

---

### ACT 8 — Passport Audit History Verification

- **Role:** Any Authorized User
- **URL:** `http://localhost:3000/app/challenges/[challengeId]?tab=history`
- **Action:** Click **History & Audit** tab on Challenge Passport.
- **Expected Visible UI State:**
  - Complete human-readable chronological timeline displaying all 8 acts:
    1. Challenge Submitted
    2. Evidence File Attached
    3. Clarification Requested & Answered
    4. Qualification Recorded (`INNOVATION_CHALLENGE v1`)
    5. HEI Candidate Identified
    6. Commitment Recorded (`v1 ACCEPTED`, `v2 WITHDRAWN`)
    7. Readiness Decision (`v1 PILOT_READY`, `v2 REVIEW_REQUIRED`)
    8. Pilot Operational Transition (`PLANNED` → `ACTIVE` → `COMPLETED`)
    9. Outcome Assessed (`INCONCLUSIVE`)
