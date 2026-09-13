# NIRNAY — SIH 2026 Jury Cheat Sheet

**Team:** CREATORZZZ | **Problem Statement:** SIH26043
**Release:** `NIRNAY MVP RC1` (Commit `2faa68e`)

---

## 1. ONE-LINE PITCH
> **"NIRNAY helps governments determine which societal challenges deserve innovation resources, whether a proposed collaboration is actually ready for pilot, and what the pilot evidence truly proves."**

---

## 2. FIVE STRONGEST DIFFERENTIATORS

1. **Problem Qualification Gate (`Facts != Decisions`):** Incoming complaints are qualified into 4 routes (`SERVICE`, `CLARIFY`, `RESEARCH_REVIEW`, `INNOVATION_CHALLENGE`). Prevents sending simple service issues into hackathons.
2. **Versioned Commitments (`Matching != Commitment`):** HEI candidate matching is separated from binding, versioned resource/legal commitments signed by university leads.
3. **Pilot Readiness Engine (`BLOCKED -> REVIEW_READY -> PILOT_READY`):** Evaluates precondition readiness. `PILOT_READY` requires explicit human authorization.
4. **Automated Dependency Invalidation:** If an accepted commitment version is `WITHDRAWN` or `EXPIRED`, readiness automatically reverts from `PILOT_READY` to `REVIEW_REQUIRED`.
5. **Evidence Integrity Engine (`Completed != Validated`):** Operational completion of a pilot is strictly separated from evidence validation. Allows `INCONCLUSIVE` outcomes to prevent wasteful scaling.

---

## 3. DEMO SEQUENCE (2 MIN 30 SEC MAX)

| Phase | Screen / Action | Key Spoken Line |
| :--- | :--- | :--- |
| **Scenario A** (55s) | `/demo` -> Open Scenario A -> **Pilot Readiness** tab | *"Status is PILOT_READY v1, dependent on Ranchi Municipal Corp's accepted commitment."* |
| | **Commitments** tab -> Record version: `WITHDRAWN` | *"When the municipality withdraws its testing site commitment..."* |
| | Return to **Pilot Readiness** tab | *"NIRNAY's Dependency Engine automatically invalidates readiness to REVIEW_REQUIRED while preserving history."* |
| **Scenario B** (65s) | `/demo` -> Open Scenario B -> **Overview** / **Plan** | *"Status is ACTIVE v2. Pre-declared plan: 41% target spoilage reduction across 240 households."* |
| | **Execution** tab -> Advance state: `COMPLETED` | *"60-day observation window finishes; state advances to COMPLETED."* |
| | **Overview** tab (Highlight status vs outcome) | *"Notice: Operational status is COMPLETED, but ZERO outcome assessment exists automatically."* |
| | **Outcome** tab -> Record outcome: `INCONCLUSIVE` | *"Sample size shifted. Evaluator records INCONCLUSIVE—work completed, but impact was not proven."* |

---

## 4. ARCHITECTURE SHORTHAND
* **Stack:** Next.js 16 (React 19), FastAPI, PostgreSQL, SQLAlchemy 2.0, Alembic, Docker.
* **Core Rule:** **"AI is advisory; deterministic rules are authoritative."**
* **Concurrency:** Append-only state versioning (`v1 -> v2`) with `expected_version` concurrency control.
* **Tests:** 112 pytest cases PASS | 26 frontend unit tests PASS | Zero Alembic migration drift (Head: `007`).

---

## 5. TOP 15 JURY QUESTIONS & ANSWERS

1. **Why not just use CPGRAMS?** CPGRAMS is a passive complaint router. NIRNAY is an active decision engine enforcing qualification, readiness, and evidence validity.
2. **Where is AI used?** AI assists in complaint categorization and HEI match suggestions. AI **never** authorizes pilot readiness or outcome validity.
3. **What is Dependency Invalidation?** If a partner university or department withdraws a required commitment, NIRNAY automatically reverts pilot status to `REVIEW_REQUIRED`.
4. **Why allow `INCONCLUSIVE` outcomes?** Because field conditions change. `INCONCLUSIVE` logs lessons learned and prevents spending millions scaling unproven solutions.
5. **How is concurrency handled?** Append-only versioning with `expected_version` checks and PostgreSQL `FOR UPDATE` row locks.
6. **Who is the target user?** Nodal State Innovation Officers, Departmental Secretaries, and University R&D Deans.
7. **Is this deployed in production?** This is an SIH MVP Release Candidate (`RC1`) evaluated using deterministic golden datasets.
8. **What stops political override?** Readiness gates physically block pilot execution state transitions until all prerequisite conditions are `SATISFIED`.
9. **How does NIRNAY handle offline venue issues?** The primary stack runs 100% locally on a single laptop via Docker Compose without internet.
10. **Does NIRNAY replace human decision-makers?** No. AI advises, state engines enforce rules, and human officers digitally sign off.
11. **Can this scale to other states?** Yes, domain taxonomies, organization registries, and workflow rules are fully configurable.
12. **How are HEIs incentivized to participate?** NIRNAY provides formal project scopes, funded commitments, and verified research metrics instead of vague MoUs.
13. **What happens if a challenge is not an innovation issue?** The Qualification Gate routes it directly to municipal service delivery (`SERVICE`).
14. **Why separate matching from commitment?** Matching only shows potential capability; commitment requires explicit resource and legal sign-off.
15. **How long to reset the demo between jury panels?** `./scripts/demo-reset.sh` resets the database to pristine initial state in < 1 second.

---

## 6. STRICT CLAIM DISCIPLINE (WHAT WE MUST NEVER CLAIM)
* ❌ **DO NOT CLAIM:** Government of Jharkhand has adopted NIRNAY.
* ❌ **DO NOT CLAIM:** BIT Mesra / NIT Jamshedpur are signed live partners.
* ❌ **DO NOT CLAIM:** Real citizens submitted challenges to this MVP.
* ❌ **DO NOT CLAIM:** Measured social impact already exists.
* ❌ **DO NOT CLAIM:** AI accuracy benchmarks exist.
* ❌ **DO NOT CLAIM:** Production security/auth is complete in MVP.
* ✔️ **ALWAYS FRAME AS:** MVP Release Candidate, deterministic golden demo dataset, proposed 4-phase state adoption plan.

---

## 7. EMERGENCY DEMO RECOVERY
* **Venue Network Fails:** Stack runs 100% locally on `http://localhost:3000`. No internet required.
* **Database Mutated:** Run `./scripts/demo-reset.sh` in terminal. Refresh browser.
* **Local Laptop Crash:** Open bookmarked hosted staging backup URL on team backup laptop.

---

## 8. MEMORABLE CLOSING LINE
> **"NIRNAY ensures that the Right Problem receives the right ecosystem, that a field pilot is genuinely Ready when we say it is ready, and that Impact is claimed only when verified by evidence. Thank you."**
