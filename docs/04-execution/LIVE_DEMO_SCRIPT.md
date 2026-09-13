# NIRNAY — Live Presentation Demo Script

**Total Duration:** 2 Minutes 20 Seconds (Strictly under 2:30 limit)
**Presenter Dashboard:** `http://localhost:3000/demo`
**Dataset:** Idempotent Golden Jury Seed (`NIRNAY MVP RC1`)

---

## DEMO TIMELINE OVERVIEW

```
0:00 ─── 0:20 : Presenter Dashboard & Readiness Overview
0:20 ─── 1:15 : SCENARIO A — Dependency Invalidation Engine (55s)
1:15 ─── 2:20 : SCENARIO B — Evidence Integrity & Outcome Engine (65s)
```

---

## DETAILED SPOKEN DEMO SCRIPT

| Time Code | Presenter Action / Click | Spoken Narration | Expected Screen State |
| :---: | :--- | :--- | :--- |
| **0:00 - 0:20** | Open `http://localhost:3000/demo` in browser. | *"We are live on the NIRNAY Presenter Dashboard. All services are connected to our local PostgreSQL database, seeded with our two deterministic jury scenarios."* | `/demo` page loaded. `DEMO READINESS` panel displays 3 green `Ready` checkmarks. |
| **0:20 - 0:35** | Click **Open Scenario A (Ward 12 Waste Challenge)** -> Navigate to **Pilot Readiness** tab. | *"Scenario A: Ward 12 Organic Waste Challenge. Notice the status is **PILOT_READY (v1)**, authorized by Nodal Officer Aditi Verma. Under readiness conditions, `HEI_COMMITMENT` is **SATISFIED**, depending on Ranchi Municipal Corporation's accepted testing site commitment."* | Scenario A Passport view loaded on **Pilot Readiness** tab. Status badge shows green `PILOT_READY (v1)`. Condition table shows `HEI_COMMITMENT` = `SATISFIED`. |
| **0:35 - 0:50** | Click **Commitments** tab -> Click **Record Commitment Version** -> Select status `WITHDRAWN` -> Rationale: *"Lab renovation prevents Ward 12 testing access"* -> Click **Record Commitment Version**. | *"Now, watch what happens when Ranchi Municipal Corporation updates its commitment to **WITHDRAWN** due to unexpected lab renovations..."* | Modal opens, values selected, form submitted. Commitment version `v2` recorded with status `WITHDRAWN`. |
| **0:50 - 1:15** | Click **Pilot Readiness** tab -> Highlight status badge and system notification. | *"Instantly, NIRNAY's Dependency Integrity Engine detects the invalidated precondition and automatically reverts pilot readiness to **REVIEW_REQUIRED (v2)**. NIRNAY preserves historical approvals for audit, but reopens readiness automatically because the underlying basis of approval changed."* | **Pilot Readiness** tab re-evaluated. Status badge automatically updated to orange `REVIEW_REQUIRED (v2)`. Precondition `HEI_COMMITMENT` marked `UNSATISFIED`. |
| **1:15 - 1:30** | Click Presenter tab/link back to `/demo` -> Click **Open Scenario B (Cold Chain Pilot)** -> View **Overview** & **Evidence Plan**. | *"Next, Scenario B: Hazaribagh Solar Cold Chain Pilot. Current operational state is **ACTIVE (v2)**. Notice our pre-declared Evidence Plan: target 41% spoilage reduction across a baseline denominator of 240 vendor households."* | Scenario B Pilot Workspace loaded on **Overview** tab. Status shows `ACTIVE (v2)`. Evidence Plan card displays baseline: `41%`, denominator: `240 households`. |
| **1:30 - 1:45** | Click **Execution** tab -> Click **Update Operational State** -> Select `COMPLETED` -> Rationale: *"60-day observation window finished"* -> Click **Update Operational State**. | *"The 60-day field observation period finishes, so the project lead advances the operational state to **COMPLETED**."* | Modal opens, `COMPLETED` selected, form submitted. Operational state timeline shows `PLANNED -> ACTIVE -> COMPLETED (v3)`. |
| **1:45 - 2:00** | Click **Overview** tab -> Highlight Operational Status vs Outcome Assessment. | *"Notice NIRNAY's core architectural separation: Operational status is COMPLETED, but **zero outcome assessment exists automatically**. Completion of execution is not impact."* | Overview tab displays Operational Status: `COMPLETED`, Outcome Assessment: `Not Evaluated` (with empty assessment alert). |
| **2:00 - 2:20** | Click **Outcome** tab -> Click **Record Outcome Assessment** -> Select Conclusion: `INCONCLUSIVE` -> Limitation: *"Denominator changed from 240 to 140 households during observation, making baseline uncomparable"* -> Click **Save Outcome Assessment**. | *"The formal evaluator records an **INCONCLUSIVE** outcome because the vendor sample size shifted mid-pilot. NIRNAY transparently displays **COMPLETED + INCONCLUSIVE**—the work finished, but impact was not proven. Most systems claim success; NIRNAY enforces evidence integrity."* | **Outcome** tab loaded. Assessment card created displaying Conclusion: `INCONCLUSIVE` (Amber badge), Limitations documented, assessed by Reviewer. |

---

## DEMO RECOVERY INSTRUCTIONS

If any action is misclicked or if a jury asks to see the starting state again:

1. Open terminal tab.
2. Run:
   ```bash
   ./scripts/demo-reset.sh
   ```
3. Refresh browser page (`Cmd + R` / `Ctrl + R`).
4. Database returns to initial pristine state in under 1 second.
