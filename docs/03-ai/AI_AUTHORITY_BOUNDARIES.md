# AI Authority Boundaries — NIRNAY

## 1. Canonical Governance Principle

NIRNAY operates under an absolute governance principle regarding Artificial Intelligence:

> **AI Proposes → Rules Constrain → Evidence Supports → Human Authorizes → Independent Review Challenges → History Preserves**

```
+-----------------------------------------------------------------------------+
|                          CANONICAL AI BOUNDARY                              |
+-----------------------------------------------------------------------------+
|  AI CAN:                                                                    |
|  - Structure raw complaint text into clean fields                           |
|  - Summarize attached ground evidence files                                 |
|  - Suggest candidate qualification routes                                   |
|  - Surface potential duplicate challenges in the database                   |
|                                                                             |
|  AI CANNOT:                                                                 |
|  - Qualify a challenge authoritatively into a route                         |
|  - Accept institutional commitments on behalf of HEIs                       |
|  - Mark a challenge as PILOT_READY                                          |
|  - Authorize municipal pilot funding or site access                         |
|  - Declare a pilot's evidence conclusion as VALIDATED                       |
|  - Resolve governance appeals or disagreement disputes                       |
+-----------------------------------------------------------------------------+
```

---

## 2. Hard Enforced Architectural Guards

1. **Database Schema Constraints**: No database table accepts an AI-generated signature as a valid authorizing actor. All decision tables (`QualificationDecision`, `ReadinessDecision`, `OutcomeAssessment`, `DecisionAssuranceRecord`) require a non-null `actor_id` belonging to a human user.
2. **API Layer Isolation**: The `ai-assistance` endpoints return advisory JSON payloads (`QualificationSuggestionResponse`, `DuplicateSuggestionResponse`). They execute zero database write operations on core governance tables.
3. **Audit Tracking**: Every AI invocation logs prompt parameters, model outputs, execution latency, and token consumption to `AIAuditLog` for administrative monitoring.
