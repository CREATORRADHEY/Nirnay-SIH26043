# Challenge Passport — NIRNAY

## 1. Overview & Purpose

The **Challenge Passport** is the single source of truth for any societal challenge registered on NIRNAY. Accessible at `/app/challenges/[challengeId]`, it consolidates the entire history of a challenge into a transparent, audit-ready digital passport.

```
+-------------------------------------------------------------------------------+
|                             CHALLENGE PASSPORT                                |
| CHG-2026-0042: Sustainable Water Management for Semi-Urban Towns              |
+-------------------------------------------------------------------------------+
|  1. Metadata & Reporter Info     | Location, Domain, Reporting Date           |
|  2. Evidence Gallery             | Photos, Sensor Logs, Verification Status   |
|  3. Qualification Decision History| Route (INNOVATION_CHALLENGE), Rationale    |
|  4. Institutional Match Directory| Matched HEIs, Candidate Status             |
|  5. Commitment Registry          | Resource Promises, Version History         |
|  6. Readiness Conditions         | SATISFIED / UNSATISFIED Dependency Check   |
|  7. Pilot Operational History    | PLANNED -> ACTIVE -> COMPLETED             |
|  8. Outcome Assessment           | Evidence Conclusion (INCONCLUSIVE/VALIDATED)|
|  9. Decision Assurance Audit Log | Rationale, Second Review, Disagreements    |
+-------------------------------------------------------------------------------+
```

---

## 2. Passport Components

1. **Header & Lifecycle Progress Bar**: Displays canonical tracking ID, creation timestamp, location badges, domain category, and current overall status.
2. **Evidence Section**: Lists attached ground evidence files with verification metadata and file type icons.
3. **Qualification History**: Displays every qualification version decision recorded by Government Nodal Reviewers, including the assigned route (`SERVICE`, `CLARIFY`, `RESEARCH_REVIEW`, `INNOVATION_CHALLENGE`), criteria evaluation scores, and rationale.
4. **Institutional Matching & Commitments**: Displays matched HEI candidates, active resource commitments, and commitment statuses (`PROPOSED`, `ACCEPTED`, `WITHDRAWN`).
5. **Readiness Evaluation**: Displays active readiness conditions, dependency evaluation logs, and current readiness status (`PILOT_READY`, `BLOCKED`, `REVIEW_REQUIRED`).
6. **Pilot Execution & Outcome Assessment**: Displays operational state history alongside the outcome evaluation, keeping `OperationalStatus` and `EvidenceConclusion` visually distinct.
7. **Decision Assurance Receipt**: Provides access to signed decision receipts, second-reviewer verification notes, and audit log entries.
