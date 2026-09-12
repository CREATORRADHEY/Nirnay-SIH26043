# NIRNAY — Implementation Guardrails

These non-negotiable architectural and operational rules govern all software development across NIRNAY (`apps/api`, `apps/web`, `packages/contracts`).

---

## 1. Single Source of Truth
- **Rule:** The FastAPI backend (`apps/api`) is the single authoritative engine for all workflow states, precondition evaluations, readiness gates, and dependency invalidations.
- **Enforcement:** Frontend components MUST NOT implement custom state calculation logic or bypass backend state validations. All UI state badges must reflect backend API responses directly.

## 2. AI Authority Boundary
- **Rule:** AI models (e.g. Gemini API) are strictly restricted to advisory and assistive capabilities (structuring reports, drafting summaries, suggesting domain classifications, detecting duplicate submissions, shortlisting HEI capabilities).
- **Enforcement:** AI MUST NOT approve qualification decisions, authorize commitments, mark cases `PILOT_READY`, declare impact, or infer causal success. Every workflow transition requires explicit human or deterministic rule execution.

## 3. Commitment Versioning & Optimistic Concurrency
- **Rule:** All commitments carry strict sequential versioning (`version: int`). Any modification to scope, effort, timeline, or resource constraints generates a new `OFFERED` version and invalidates previous acceptances.
- **Enforcement:** All versioned mutation endpoints MUST require an `expected_version` parameter. If `expected_version` does not match the current database version, the API MUST reject the request with `HTTP 409 Conflict`.

## 4. Idempotency on Mutation Endpoints
- **Rule:** Critical state mutation endpoints (qualification transitions, commitment sign-offs, readiness authorizations, evidence logs) must prevent accidental duplicate execution caused by network retries.
- **Enforcement:** Mutation endpoints MUST support an `idempotency_key` header or payload field, caching execution results to return identical responses for retried calls.

## 5. History & Audit Trail Preservation
- **Rule:** Workflow state history, commitment revisions, evaluation logs, and readiness sign-offs MUST be permanently appended to audit logs.
- **Enforcement:** Hard deletion (`DELETE`) of workflow entities, state logs, or commitments is strictly forbidden. Schema updates use soft invalidation or status transitions.

## 6. Automated Dependency Invalidation (P2 Engine)
- **Rule:** When an accepted commitment, local permission, or prerequisite condition is altered, withdrawn, or expired, the Dependency Integrity Engine MUST automatically flag affected downstream readiness decisions as `REVIEW_REQUIRED`.
- **Enforcement:** Pilots cannot proceed while in `REVIEW_REQUIRED`. Re-authorization requires explicit human review of the updated dependencies.

## 7. Scope Isolation of Dependency Checks
- **Rule:** Dependency invalidation must strictly isolate affected downstreams.
- **Enforcement:** Modifying or invalidating a commitment for Challenge A MUST NOT alter or reopen unrelated commitments or readiness decisions for Challenge B.

## 8. Legitimacy of Negative & Inconclusive Outcomes
- **Rule:** Early pilot termination (`STOPPED`) and inconclusive evidence conclusions (`INCONCLUSIVE`) are valid, first-class platform outcomes.
- **Enforcement:** System UI and analytics dashboards MUST treat `STOPPED` and `INCONCLUSIVE` as valuable learning assets, preserving logs to prevent duplicate failed pilots across districts.

## 9. Synthetic Data Disclosure & Labeling
- **Rule:** All synthetic, mock, or seeded demonstration datasets must be explicitly flagged with `is_synthetic: true` / `DEMO_MODE=true`.
- **Enforcement:** Synthetic demo data MUST NEVER be presented as real Government of Jharkhand operational data or actual measured public impact.

## 10. Decoupling of Demo Roles from Production Auth
- **Rule:** Demo role switching (allowing reviewers to view UI perspectives as Reporter, Coordinator, HEI Lead, Local Authority, or Evaluator) MUST be implemented via isolated header/context mechanisms.
- **Enforcement:** Demo role switching MUST NOT leak into or alter production OAuth/JWT security middleware.

## 11. Strict Feature Boundary
- **Rule:** No feature expansion outside the locked specifications of DOC00 v2.0 and DOC01 v1.0 is permitted without an explicit, documented Decision Register update.
- **Enforcement:** Avoid introducing premature features (e.g. complex procurement engines, social media feeds, or black-box AI scoring) during domain implementation.
