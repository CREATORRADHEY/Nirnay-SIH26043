# P5.3 AI Clarity & Practical Evaluation Report

**Project:** NIRNAY — Societal Innovation Collaboration & Readiness Platform  
**Problem Statement:** SIH26043  
**Team:** CREATORZZZ  
**Branch:** `feature/p5.3-ai-evaluation`  
**Date:** 2026-09-25  

---

## 1. AI Responsibilities (Canonical 4-Capability Model)

All AI capabilities in NIRNAY are categorized into four canonical categories:

1. **STRUCTURE**: Convert unstructured Hinglish/English problem text into structured draft challenge fields (`POST /api/v1/ai/challenges/extract`).
2. **SUMMARIZE**: Summarize submitted evidence, clarification histories, and relevant challenge context (`POST /api/v1/ai/challenges/{id}/evidence-summary`).
3. **SUGGEST**: Provide non-authoritative qualification route suggestions (`POST /api/v1/ai/challenges/{id}/qualification-suggestion`) and match HEI candidates from an authorized active capability universe (`POST /api/v1/ai/challenges/{id}/hei-candidate-suggestion`).
4. **FIND PATTERNS**: Detect potential duplicate submissions and highlight recurring regional issue patterns (`POST /api/v1/ai/challenges/{id}/duplicate-suggestion`).

---

## 2. AI Prohibition List (Boundary Rules)

AI is strictly prohibited from holding public governance authority. **AI MUST NOT:**

1. Approve or reject a challenge submission
2. Declare a citizen or submission genuine vs fake
3. Record an authoritative `QualificationRoute`
4. Create or accept an institutional commitment
5. Create a `PILOT_READY` readiness decision
6. Resolve reviewer disagreement
7. Decide stakeholder appeals or review requests
8. Allocate government funding or institutional resources
9. Declare causal societal impact
10. Create a `VALIDATED` outcome assessment
11. Silently mutate authoritative domain state
12. Bypass `PolicyService` authorization checks

Regression testing (`apps/api/app/tests/test_ai_boundaries.py`) verifies zero database mutations occur during AI assistance API invocations.

---

## 3. Architecture Boundary Diagram

```
[ Citizen / Public Submission ]
              ↓
    [ Context Builder ] (Redacts PII, fetches authorized HEI/evidence bounds)
              ↓
     [ AI Provider ] (Generates advisory output)
              ↓
  [ Schema Validation ] (Pydantic validation, discards out-of-set candidates)
              ↓
[ Advisory Response ] (Visually labeled "AI ADVISORY — NON-AUTHORITATIVE")
              ↓
   [ Human Reviewer ] (Inspects facts, evidence, rubric, and rationale)
              ↓
[ Authoritative Action ] (PolicyService authorized DB state mutation)
```

---

## 4. Controlled Synthetic Evaluation Dataset Composition

The controlled evaluation suite (`apps/api/app/services/ai_evaluation_dataset.py`) comprises **30 synthetic test cases**:

- **SERVICE** (7 cases): Routine infrastructure, municipal repairs, and administrative backlog issues.
- **CLARIFY** (6 cases): Ambiguous descriptions, missing lab reports, or insufficient evidence.
- **RESEARCH_REVIEW** (8 cases): Hydrogeology, materials science, agricultural engineering, and chemical R&D problems requiring academic research.
- **INNOVATION_CHALLENGE** (9 cases): Off-grid thermal storage, IoT flood sensing, rural enterprise hardware, and field pilot challenges.

---

## 5. Provenance & Factual Evaluation Metrics (Controlled Suite)

Every metric in NIRNAY is tagged with its exact evidence provenance class:

| Metric | Provenance Class | Numerator / Denominator | Result / Percentage | Interpretation & Provenance Detail |
|---|---|---|---|---|
| **Synthetic Dual-Reviewer Fixture Agreement** | Synthetic Fixture | 24 / 30 | **80.0%** | Agreement between Reviewer A and Reviewer B deterministic dataset fixtures. |
| **AI-Synthetic Fixture Match** | Synthetic Fixture | 22 / 30 | **73.3%** | AI advisory suggestion matched Reviewer A deterministic fixture route. |
| **AI-Reference Scenario Match** | Synthetic Fixture | 25 / 30 | **83.3%** | AI advisory suggestion matched synthetic reference scenario label. |
| **Escalation / Dual Review Rate** | Synthetic Fixture | 6 / 30 | **20.0%** | Triggered independent second review due to ambiguity or fixture disagreement. |
| **AI Override Rate** | Synthetic Fixture | 5 / 30 | **16.7%** | Reviewer selected a final route differing from AI advisory suggestion. |
| **AI Failure Rate** | Automated Testing | 0 / 30 | **0.0%** | System handled all advisory calls without unhandled exception. |
| **Schema Rejection Rate** | Automated Testing | 0 / 30 | **0.0%** | All outputs satisfied Pydantic schema constraints. |
| **Unknown Candidate Rejection** | Automated Testing | 0 / 30 | **0 out of 30** | Out-of-set candidate entities strictly discarded (0 out-of-set candidates accepted across 30 tested outputs). |
| **Manual Workflow Completion** | Automated Testing | 30 / 30 | **100.0%** | All 30 cases completed cleanly via manual workflow. |
| **AI-OFF Test Suite Pass** | Automated Testing | 30 / 30 | **100.0%** | Core lifecycle passed the controlled AI-disabled test suite (`NIRNAY_AI_PROVIDER=disabled`). |

---

## 6. Review Time & Usability Instrumentation

Review-time instrumentation is implemented in the evaluation workspace. 
**Real comparative usability measurement is pending field trial.**

- **Baseline Manual Simulation**: 12.5 minutes per complex challenge
- **Assisted Simulation**: 4.2 minutes per complex challenge
- **Status**: Usability instrumentation logging enabled; live human field trial measurement pending P6 field deployment.

---

## 7. Required Explicit Limitations

> [!WARNING]
> **Explicit Provenance & Evidence Limitations:**
> 1. **Synthetic Dataset Provenance**: Metrics are derived from a 30-case synthetic evaluation suite. They do NOT represent live human field trials or statewide accuracy.
> 2. **Fixture-Label Provenance**: Reviewer A and Reviewer B routes are deterministic synthetic fixtures. They do NOT represent live dual human adjudication.
> 3. **Timing Claim Boundary**: Review duration numbers are simulated benchmark parameters. Real comparative usability measurement is pending field trial.
> 4. **Agreement != Ground Truth**: High AI-fixture agreement indicates consistency with reference scenario labels, NOT absolute truth.
> 5. **No Causal Social Claim**: AI evaluation metrics do NOT imply or claim causal societal impact.

---

## 8. Jury Q&A Reference Guide

### Q: "What exactly is AI doing here?"
**A:** "AI handles information-heavy assistance: structuring messy citizen submissions, summarizing evidence, suggesting a qualification route, and finding related regional patterns. It cannot approve a challenge, accept institutional commitment, mark a pilot ready, or declare impact. Those remain authorized human decisions enforced by deterministic backend rules."

### Q: "Why use AI if a human still decides?"
**A:** "The expensive part of review is reading, structuring, and searching through unstructured information. AI assists in structuring context; it does not replace reviewer accountability."

### Q: "What if AI is wrong?"
**A:** "Nothing authoritative happens automatically. The human reviewer may reject the suggestion, the disagreement is recorded as metadata, and higher-risk disagreement triggers independent second review."

### Q: "What if AI goes down?"
**A:** "NIRNAY continues seamlessly through the manual workflow. The core lifecycle passed the controlled AI-disabled test suite (100% completion in automated suite)."
