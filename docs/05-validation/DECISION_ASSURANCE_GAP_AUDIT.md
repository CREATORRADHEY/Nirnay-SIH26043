# Decision Assurance Gap Audit & Governance Assessment

> **Project**: NIRNAY — Societal Innovation Collaboration & Readiness Platform (SIH26043)  
> **Phase**: P5.0 Final Product Cleanup & Foundation Audit  
> **Document ID**: `DECISION_ASSURANCE_GAP_AUDIT.md`

---

## 1. Executive Summary

This document audits NIRNAY’s four core authoritative decision gates: **Qualification**, **Commitment Binding**, **Pilot Readiness Governance**, and **Outcome Assessment**. 

The goal is to analyze current implementation capabilities against decision assurance criteria and identify gaps to be addressed in subsequent product phases.

---

## 2. Decision Assurance Matrix

| Audit Question | 1. Qualification Decision | 2. Commitment Binding | 3. Readiness Governance | 4. Outcome Assessment |
| :--- | :--- | :--- | :--- | :--- |
| **Visible Evidence to Reviewer** | Field issue intake text, citizen attachments, baseline metrics | HEI capability dossier, lab equipment list, faculty capacity | Condition satisfaction matrix, HEI commitments status | Pre-declared evidence plan, baseline vs field outcome telemetry |
| **Mandatory Rationale?** | Yes (`rationale` field required on POST) | Yes (`rationale` required on commitment record) | Yes (`rationale` required on readiness decision) | Yes (`rationale` required on outcome assessment) |
| **Explicit Criteria / Rubric?** | Yes (`QualificationRoute` enum options) | Yes (`CommitmentStatus` enum: OFFERED/ACCEPTED) | Yes (`ConditionStatus` matrix per prerequisite) | Yes (`EvidenceConclusion` enum & baseline comparison) |
| **Inspectable Reasoning by 3rd Party?** | Yes (via Challenge Passport & Audit Trail) | Yes (via Commitment Roster) | Yes (via Readiness Audit Log) | Yes (via Field Pilot Workspace) |
| **Superseded by Later Decision?** | Yes (New version appends; `is_current` updates) | Yes (State transitions e.g. ACCEPTED -> WITHDRAWN) | Yes (Automatic Invalidation `REVIEW_REQUIRED`) | Yes (Evaluator re-assessment appends new version) |
| **Historical Preservation?** | Yes (Full append-only version history) | Yes (Full version history) | Yes (Full version history) | Yes (Full version history) |
| **Disagreement / Appeal Supported?** | ⚠️ Partial: Can create superseding decision version | ⚠️ Partial: HEI can withdraw or dispute status | ⚠️ Partial: Nodal Officer re-evaluates | ⚠️ Partial: Requires manual re-assessment entry |
| **Conflict-of-Interest Handled?** | ⚠️ Future Phase: Relies on RBAC & Org Scope | ⚠️ Future Phase: Checked by Org Membership | ⚠️ Future Phase: Handled by PolicyService | ⚠️ Future Phase: Evaluator Actor ID logged |
| **AI Suggestion Decoupled from Authority?** | Yes: AI badge marked `is_ai_advisory: true` | Yes: HEI Director manually commits | Yes: Human official executes authorization | Yes: Human evaluator selects outcome status |

---

## 3. Identified Gaps & Recommendations for Next Phase

1. **Explicit Rubric Checklist**: While `rationale` is mandatory, adding explicit structured multi-criteria scorecards for qualification will improve reviewer alignment.
2. **Conflict of Interest Declaration**: Add explicit self-recusal check (`no_conflict_of_interest: true`) before a reviewer executes readiness or outcome sign-off.
3. **Formal Disagreement / Appeal Workflow**: Implement a dedicated `APPEAL_REQUESTED` state transition track for contested readiness invalidations.
4. **Multi-Signatory Co-Approval**: Enable multi-party sign-off requirement for high-budget public pilots.
