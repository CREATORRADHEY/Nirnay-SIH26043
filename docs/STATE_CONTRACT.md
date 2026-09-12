# NIRNAY — Canonical State Contract

This document defines the official, non-negotiable state machines governing NIRNAY lifecycle workflows. All backend models, API endpoints, frontend views, and database schemas must conform strictly to these state definitions.

---

## 1. Qualification Routes (`QualificationRoute`)

Evaluated at the **Problem Qualification Gate** after problem intake.

### `SERVICE`
- **Meaning:** Problem is a routine municipal, administrative, or operational grievance that belongs in an existing service portal or department, not an innovation/research pipeline.
- **Who can cause it:** Programme Coordinator / Evaluator (assisted by AI classification).
- **Valid next states:** Terminal within NIRNAY (transferred to external department/portal).
- **Invariants:** Must record target department and routing justification. Cannot be assigned to an HEI for pilot development.

### `CLARIFY`
- **Meaning:** Problem submission lacks sufficient geographic data, physical evidence, or operational context required to make a qualification decision.
- **Who can cause it:** Programme Coordinator.
- **Valid next states:** `SERVICE`, `CLARIFY`, `RESEARCH_REVIEW`, `INNOVATION_CHALLENGE`.
- **Invariants:** Must record specific missing information items requested from the reporter.

### `RESEARCH_REVIEW`
- **Meaning:** Problem represents a complex societal issue requiring foundational academic study, baseline data collection, or literature review before any field pilot can be conceptualized.
- **Who can cause it:** Programme Coordinator / Academic Evaluator.
- **Valid next states:** `INNOVATION_CHALLENGE`, `SERVICE`.
- **Invariants:** Assigned to HEI research cell for baseline analysis; cannot directly enter field pilot execution from this route.

### `INNOVATION_CHALLENGE`
- **Meaning:** Problem is qualified as a genuine societal innovation challenge suitable for university-industry pilot development.
- **Who can cause it:** Authorized Programme Coordinator.
- **Valid next states:** Institutional Matchmaking & Commitment Phase.
- **Invariants:** Requires verified problem scope, domain classification, and confirmed local impact relevance.

---

## 2. Commitment States (`CommitmentStatus`)

Governs resource, mentorship, funding, and permission agreements between actors.

### `PROPOSED`
- **Meaning:** Initial draft of a commitment requirement (resource, faculty mentor, testing lab, or local permission) created for an institutional actor.
- **Who can cause it:** Project Team Lead / Programme Coordinator.
- **Valid next states:** `OFFERED`, `WITHDRAWN`, `EXPIRED`.
- **Invariants:** Defines initial scope, resource requirements, and target actor.

### `OFFERED`
- **Meaning:** Formal terms of commitment presented to target actor (HEI lead, Local Authority, Industry sponsor) for sign-off.
- **Who can cause it:** Initiating Actor / Programme Coordinator.
- **Valid next states:** `ACCEPTED`, `DECLINED`, `WITHDRAWN`, `EXPIRED`.
- **Invariants:** Carries specific resource effort, dates, constraints, version number (`version`), and expiration timestamp (`expires_at`).

### `ACCEPTED`
- **Meaning:** Target actor has formally accepted and signed off on the exact scope and terms of the commitment version.
- **Who can cause it:** Designated Target Actor (Faculty Lead, Local Official, Industry Rep).
- **Valid next states:** `OFFERED` (if scope is modified -> creates a new version), `WITHDRAWN`, `EXPIRED`.
- **Invariants:** Tied strictly to the exact commitment version (`version`). Any modification creates a new `OFFERED` version and invalidates previous acceptance.

### `DECLINED`
- **Meaning:** Target actor has formally rejected the commitment offer.
- **Who can cause it:** Designated Target Actor.
- **Valid next states:** `PROPOSED` (if revised and re-submitted as a new offer).
- **Invariants:** Reason for rejection must be recorded in audit log.

### `WITHDRAWN`
- **Meaning:** Initiating party or coordinator has canceled the commitment offer.
- **Who can cause it:** Initiating Actor / Programme Coordinator.
- **Valid next states:** Terminal state for this commitment version.
- **Invariants:** Automatically transitions any linked readiness conditions to `UNSATISFIED` or `UNKNOWN`.

### `EXPIRED`
- **Meaning:** Commitment offer or active agreement passed its validity timestamp without renewal.
- **Who can cause it:** Automated System Background Job.
- **Valid next states:** `OFFERED` (if re-offered with updated validity window).
- **Invariants:** Automatically invalidates dependent readiness conditions.

---

## 3. Condition States (`ConditionStatus`)

Evaluates individual prerequisites (permissions, faculty mentors, equipment, baseline data) required for pilot readiness.

### `SATISFIED`
- **Meaning:** Precondition is fully met by an active, accepted commitment and valid supporting evidence.
- **Who can cause it:** System Condition Evaluator / Authorized Reviewer.
- **Valid next states:** `UNSATISFIED`, `UNKNOWN`, `DISPUTED`, `EXPIRED`.
- **Invariants:** Must link directly to an active `ACCEPTED` commitment version and valid evidence record.

### `UNSATISFIED`
- **Meaning:** Mandatory precondition is explicitly unfulfilled or missing required accepted commitments.
- **Who can cause it:** System Condition Evaluator / Coordinator.
- **Valid next states:** `SATISFIED`, `UNKNOWN`, `DISPUTED`.
- **Invariants:** Automatically blocks readiness gate (`BLOCKED`).

### `UNKNOWN`
- **Meaning:** Precondition status cannot be determined due to unverified data or missing documentation.
- **Who can cause it:** System Condition Evaluator.
- **Valid next states:** `SATISFIED`, `UNSATISFIED`.
- **Invariants:** Evaluated as unsatisfied by the readiness gate (`BLOCKED`).

### `DISPUTED`
- **Meaning:** Precondition validity or commitment scope is contested by a participating stakeholder.
- **Who can cause it:** Problem Owner / HEI Lead / Sponsor.
- **Valid next states:** `SATISFIED`, `UNSATISFIED`.
- **Invariants:** Triggers human review alert; blocks readiness gate (`BLOCKED`).

### `EXPIRED`
- **Meaning:** Precondition validity window lapsed due to an expired underlying commitment or stale evidence.
- **Who can cause it:** Automated System Check.
- **Valid next states:** `SATISFIED` (upon renewal).
- **Invariants:** Invalidates pilot readiness.

---

## 4. Readiness States (`ReadinessStatus`)

Evaluates whether a qualified challenge can proceed to a field pilot.

### `BLOCKED`
- **Meaning:** Challenge cannot launch a field pilot because one or more mandatory preconditions are `UNSATISFIED`, `UNKNOWN`, `DISPUTED`, or `EXPIRED`.
- **Who can cause it:** System Readiness Evaluator (Automatic).
- **Valid next states:** `REVIEW_READY`.
- **Invariants:** Field pilot launch is strictly forbidden.

### `REVIEW_READY`
- **Meaning:** All mandatory readiness preconditions are `SATISFIED`; awaiting human authorized sign-off.
- **Who can cause it:** System Readiness Evaluator (Automatic).
- **Valid next states:** `PILOT_READY`, `BLOCKED`.
- **Invariants:** Requires explicit human authorization to transition to `PILOT_READY`.

### `PILOT_READY`
- **Meaning:** Challenge is formally authorized and verified as ready for field pilot execution.
- **Who can cause it:** Authorized Human Approver (Programme Coordinator / Problem Owner).
- **Valid next states:** `REVIEW_REQUIRED` (if an underlying dependency changes).
- **Invariants:** **AI CANNOT authorize this transition.** Requires human digital sign-off record.

### `REVIEW_REQUIRED`
- **Meaning:** A previously `PILOT_READY` challenge has had an underlying commitment, permission, or condition altered or invalidated, requiring re-review.
- **Who can cause it:** Custom Dependency Integrity Engine (Automatic).
- **Valid next states:** `PILOT_READY` (after human re-authorization), `BLOCKED`.
- **Invariants:** Suspends pilot execution until human re-review occurs.

---

## 5. Operational Status (`OperationalStatus`)

Tracks field pilot execution lifecycle.

### `PLANNED`
- **Meaning:** Pilot field logistics, site preparation, and team deployment scheduled.
- **Who can cause it:** Project Team Lead / Coordinator.
- **Valid next states:** `ACTIVE`, `STOPPED`.
- **Invariants:** Requires an active, approved Pilot Evidence Plan.

### `ACTIVE`
- **Meaning:** Pilot is actively executing in the field and collecting evidence observations.
- **Who can cause it:** Project Team Lead.
- **Valid next states:** `COMPLETED`, `STOPPED`.
- **Invariants:** Field observations and metric data are actively recorded.

### `COMPLETED`
- **Meaning:** Field deployment timeline and planned evidence collection phase finished.
- **Who can cause it:** Project Team Lead / Coordinator.
- **Valid next states:** Moves to Outcome Review (`NOT_REVIEWED`).
- **Invariants:** Does NOT imply positive impact; outcome evaluation is evaluated separately.

### `STOPPED`
- **Meaning:** Pilot terminated early due to adverse effects, stop-rule trigger, resource withdrawal, or safety concerns.
- **Who can cause it:** Problem Owner / Evaluator / Coordinator / System Stop-Rule Trigger.
- **Valid next states:** Moves to Outcome Review (`NOT_REVIEWED`).
- **Invariants:** Reason for termination must be documented. Valid operational end state.

---

## 6. Evidence Conclusion (`EvidenceConclusion`)

Evaluates pilot outcomes based on verified metric data.

### `NOT_REVIEWED`
- **Meaning:** Pilot completed or stopped, but formal evaluator review has not occurred.
- **Who can cause it:** System default upon pilot completion/stop.
- **Valid next states:** `VALIDATED`, `ITERATE`, `INCONCLUSIVE`.
- **Invariants:** Requires assigned Evaluator review.

### `VALIDATED`
- **Meaning:** Pilot evidence demonstrated target social impact without unmitigated adverse effects.
- **Who can cause it:** Designated Evaluator / Review Panel.
- **Valid next states:** Terminal outcome state; eligible for scaling recommendations.
- **Invariants:** Must be supported by verified metrics comparing baseline to pilot observation.

### `ITERATE`
- **Meaning:** Pilot demonstrated potential but revealed technical or process flaws requiring re-design.
- **Who can cause it:** Designated Evaluator.
- **Valid next states:** Re-enters pipeline as an `INNOVATION_CHALLENGE` iteration.
- **Invariants:** Specific iteration recommendations and failure points must be documented.

### `INCONCLUSIVE`
- **Meaning:** Evidence gathered was insufficient, flawed, or ambiguous to prove or disprove impact.
- **Who can cause it:** Designated Evaluator.
- **Valid next states:** Terminal outcome state.
- **Invariants:** Entirely valid outcome; preserves learning to prevent repeated failed pilots.
