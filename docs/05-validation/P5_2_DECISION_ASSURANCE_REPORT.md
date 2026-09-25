# NIRNAY — P5.2 DECISION ASSURANCE REPORT

**Project:** NIRNAY — Societal Innovation Collaboration & Readiness Platform  
**Problem Statement:** SIH26043  
**Team:** CREATORZZZ  
**Branch:** `feature/p5.2-decision-assurance`  
**Date:** 2026-09-25  

---

## EXECUTIVE SUMMARY

Phase P5.2 establishes the **Decision Assurance Layer** for the NIRNAY platform, answering the critical governance question: *"How do we know the human making an authoritative decision is making a reasonable decision?"*

Rather than relying on unverified human trust or synthetic AI accuracy scores, NIRNAY enforces a reviewable decision process across all authoritative gates (Qualification, Pilot Readiness, Outcome Conclusion).

---

## 1. IMPLEMENTED GOVERNANCE CONTROLS

1. **Structured Criteria Rubrics:**
   - 5-question evaluation rubric for qualification (`YES` / `NO` / `UNCERTAIN`).
   - Rubrics constrain and structure human reasoning without auto-computing choices.

2. **Evidence Basis Traceability:**
   - Authoritative decisions require explicit evidence references.
   - Validation rejects decisions submitted with zero evidence or empty rationale.

3. **Meaningful Human Rationale Validation:**
   - Stringent length and vocabulary validation rejecting generic placeholder text ("ok", "approved", "yes").

4. **Visual AI Boundary Isolation:**
   - AI Advisory rendered in separate card marked `AI ADVISORY — NON-AUTHORITATIVE`.
   - Explicit system boundary stating AI cannot submit authoritative decisions.
   - AI-human agreement tracked as observational metadata only (`AGREEMENT` / `DISAGREEMENT`).

5. **Deterministic Second-Review Triggers:**
   - Triggered when AI & human disagree on qualification route.
   - Triggered when reviewer declares `POTENTIAL_CONFLICT`.
   - Triggered when rubric criteria are marked `UNCERTAIN`.
   - Triggered when affected stakeholders submit a formal review request / appeal.

6. **Server-Side Independent Review Enforcement:**
   - Reviewer 2 MUST NOT equal Reviewer 1 (enforced at database & service layer).
   - Independent 2nd review creates `AGREED` or `DISAGREED` review status.
   - Disagreements resolved by Senior Reviewer / Admin with authoritative resolution rationale.
   - Both original reviews remain preserved in append-only version history.

7. **Stakeholder Appeal Mechanism:**
   - Stakeholders can submit review requests referencing new evidence.
   - Review requests trigger 2nd review without deleting or overwriting historical truth.

---

## 2. DATABASE SCHEMA & MIGRATION SUMMARY

- **Migration:** `013_decision_assurance` (Alembic head)
- **New Tables:**
  - `decision_assurance_records`: Stores decision type, authoritative decision reference, reviewer actor ID, rubric snapshot, evidence IDs, rationale, AI agreement status, conflict declaration, 2nd reviewer ID, 2nd review decision, and senior resolution rationale.
  - `decision_review_requests`: Stores stakeholder review requests linked to challenge and assurance records.

---

## 3. VERIFICATION & QUALITY GATES

- **Contract Parity Check (`scripts/check-contracts.py`):** `NIRNAY contract parity: PASS`
- **Alembic Current Head:** `013_decision_assurance (head)`
- **Pytest Suite (`apps/api`):** 150 passed in 3.59s
- **Web Typecheck (`tsc`):** `PASS` (0 errors)
- **Web Build (`next build`):** `PASS` (30/30 pages compiled statically/dynamically)

---

## 4. REMAINING LIMITATIONS & P5.3 HANDOFF

- **P5.3 Benchmark Dataset:** Calibrated evaluation datasets and agreement metrics will be introduced in P5.3.
- **Decision Assurance Scope:** No AI auto-decision authority was added; AI remains strictly non-authoritative.
