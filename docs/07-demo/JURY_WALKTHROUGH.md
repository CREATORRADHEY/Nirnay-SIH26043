# Jury Walkthrough — NIRNAY

## 1. Jury Evaluation Workspace Overview

The **Jury Evaluation Workspace** (`/app/evaluation` & `/demo`) is a dedicated simulation area engineered specifically for hackathon evaluation panels and academic auditors.

It allows judges to inspect technical proof points, trigger synthetic governance scenarios, and reset test environments without corrupting live data.

```
+-----------------------------------------------------------------------------+
|                     PRACTICAL JURY EVALUATION WORKSPACE                     |
|                      Route: /app/evaluation & /demo                         |
+-----------------------------------------------------------------------------+
|  Scenario 1: Automated Readiness Invalidation (Scenario A)                  |
|  Scenario 2: Separation of Completion vs. Impact (Scenario B)               |
|  Scenario 3: Problem Qualification Gate Filter                              |
|  Scenario 4: Decision Assurance & Second Review Audit                       |
|                                                                             |
|  [Run 90-Sec Jury Tour]   [Reset All Scenarios]   [Export Audit Receipt]    |
+-----------------------------------------------------------------------------+
```

---

## 2. Interactive Jury Actions

1. **Run 90-Sec Jury Tour**: Launches the interactive spotlight overlay walking through all key milestone screens.
2. **Execute Scenario A Invalidation**: Triggers commitment withdrawal on Ward 12 Waste Challenge. Demonstrates instant transition from `PILOT_READY` to `REVIEW_REQUIRED`.
3. **Execute Scenario B Outcome Integrity**: Views Hazaribagh Cold Chain Pilot. Demonstrates operational `COMPLETED` status combined with `INCONCLUSIVE` evidence conclusion.
4. **Reset Scenarios**: Resets synthetic test records to initial baseline state (`POST /api/v1/jury-evaluation/reset`).
