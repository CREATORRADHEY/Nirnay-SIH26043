# NIRNAY P5.4 — Human Usability Testing Protocol

**Project:** NIRNAY — Societal Innovation Collaboration & Readiness Platform  
**Problem Statement:** SIH26043  
**Team:** CREATORZZZ  
**Phase:** P5.4 Practical Jury Evaluation Workspace  
**Document Status:** Approved Protocol for External Usability Testing  

---

## 1. Executive Summary & Objective

The P5.4 Usability Testing Protocol defines a standardized, unguided evaluation procedure for 3–5 independent external evaluators (jury proxy testers) to test NIRNAY's core governance mechanisms.

The objective is to measure whether external evaluators can independently navigate and verify platform mechanics without click-by-click coaching, assessing interface clarity, recovery capability, and state understanding.

> **CRITICAL DISCIPLINE RULE:**  
> Test protocol instructions are defined in advance. Operational metrics must NEVER be fabricated or assumed. Raw tester feedback and timing data are recorded during live execution sessions only.

---

## 2. Participant & Environment Setup

### 2.1 Participant Requirements
* **Cohort Size:** 3 to 5 external evaluators (representatives of civic governance, academic R&D, or external jury reviewers).
* **Prerequisites:** Basic web browser familiarity; zero prior technical coaching on NIRNAY codebase.

### 2.2 Environment & Materials
* **Evaluation URL:** `http://localhost:3000/app/evaluation`
* **Provided Context Statement (Exact 1-Sentence Prompt):**
  > *"NIRNAY is a societal innovation governance platform where you can test how routine civic service issues are separated from R&D innovation, how HEI commitments are authorized, and how pilot dependencies are tracked when conditions change."*
* **Prohibited Assistance:** Evaluators MUST NOT be guided click-by-click or told which buttons to press.

---

## 3. Evaluation Tasks

Each tester is requested to perform three primary tasks in sequence:

### Task 1: Scenario 01 — RIGHT PROBLEM (Routine Service Protection)
* **Goal:** Evaluate a routine municipal utility issue (transformer fuse outage) and record a qualification decision.
* **Target Outcome:** Evaluator routes the issue as `SERVICE` with a structured rubric and non-authoritative AI advisory.
* **Verification Check:** Live backend checklist displays `SERVICE` route and persisted rubric rationale.

### Task 2: Scenario 03 — DEPENDENCY INVALIDATION (Hero Scenario)
* **Goal:** Test what happens when an active higher education institution commitment is withdrawn after readiness sign-off.
* **Target Outcome:** Evaluator inspects `PILOT_READY` v1 state, triggers commitment withdrawal v2, and observes automatic `REVIEW_REQUIRED` appending.
* **Verification Check:** Live backend checklist confirms `PILOT_READY` preserved in history while `REVIEW_REQUIRED` is appended.

### Task 3: Scenario 04 — OUTCOME INTEGRITY (Completion vs Validation)
* **Goal:** Review a completed agricultural cooling cart field pilot.
* **Target Outcome:** Evaluator records an outcome decision without falsely claiming success (`INCONCLUSIVE`).
* **Verification Check:** Operational status remains `COMPLETED` while evidence conclusion records `INCONCLUSIVE`.

---

## 4. Measured Operational Metrics

During test execution, the observer records the following empirical parameters for each tester:

1. **Task Completion Rate:** Binary success / failure per scenario.
2. **Task Completion Time:** Elapsed seconds from scenario launch to pass state verification.
3. **Wrong-Click / Recovery Events:** Count of non-productive navigation clicks and self-correction time.
4. **Unsolicited Questions / Points of Confusion:** Specific screens or labels where tester expressed ambiguity.
5. **System Usability Scale (SUS):** Optional standard 10-question post-test questionnaire (if deliberately administered).
6. **Qualitative Feedback:** Direct quotes regarding governance clarity vs administrative effort.

---

## 5. Protocol Execution Log Sheet Template

```markdown
| Tester ID | Scenario | Completion (Pass/Fail) | Elapsed Time (min:sec) | Wrong Clicks | Points of Confusion |
|-----------|----------|------------------------|-----------------------|--------------|---------------------|
| Tester 01 | Sc 01    |                        |                       |              |                     |
| Tester 01 | Sc 03    |                        |                       |              |                     |
| Tester 01 | Sc 04    |                        |                       |              |                     |
| Tester 02 | Sc 01    |                        |                       |              |                     |
| Tester 02 | Sc 03    |                        |                       |              |                     |
| Tester 02 | Sc 04    |                        |                       |              |                     |
```

---

## 6. Claim Discipline & Data Handling

* Evaluation records created during testing remain strictly tagged as `SYNTHETIC EVALUATION SCENARIO`.
* Raw usability logs are stored separately in session archives and must never be merged into production database tables.
