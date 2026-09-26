# Project Overview — NIRNAY (SIH26043)

## 1. Executive Summary

**NIRNAY** (*Right Problem. Ready Pilot. Proven Outcome.*) is an integrated civic innovation platform designed to solve a fundamental disconnect in public sector innovation governance across India: the gap between citizen-reported civic challenges, institutional academic/industry R&D capability, pilot readiness verification, and factual outcome validation.

Developed for Smart India Hackathon (SIH26043) by **Team CREATORZZZ**, NIRNAY replaces fragmented, ad-hoc municipal problem reporting with a rigorous 9-stage governance pipeline.

---

## 2. The Core Problem

Across municipal corporations, state urban development departments, and district administrations in India (such as in Jharkhand's urban and semi-urban centers like Ranchi and Hazaribagh), public innovation initiatives suffer from systemic failures:

1. **Unqualified Problem Escalation**: Minor service maintenance complaints (e.g., localized drain blockages or streetlight replacement) are frequently mislabeled as high-priority "innovation challenges", wasting university R&D grants and municipal innovation budgets.
2. **Fictional Readiness**: Higher Education Institutions (HEIs) or startup innovators are assigned to civic issues before securing critical prerequisites (such as municipal site access, baseline datasets, or safety clearances).
3. **Silent Dependency Invalidation**: When an institutional commitment or resource promise changes during project execution, the pilot's readiness state remains unchanged in legacy records, leading to failed field trials.
4. **Conflation of Completion and Impact**: A pilot project reaching operational end date (`COMPLETED`) is routinely claimed as a success, regardless of whether measurable societal impact was proven (`INCONCLUSIVE` vs `VALIDATED`).

---

## 3. The NIRNAY Solution

NIRNAY resolves these challenges through an authoritative, audit-backed governance pipeline:

```mermaid
graph LR
    Sub[1. Challenge Submission] --> Qua[2. Problem Qualification Gate]
    Qua --> Match[3. HEI / Industry Matching]
    Match --> Comm[4. Commitment & Condition Check]
    Comm --> Read[5. Automated Readiness Invalidation]
    Read --> Exe[6. Controlled Pilot Execution]
    Exe --> Out[7. Outcome Integrity Verification]
```

### Key Pillars
- **Challenge Passport**: A comprehensive, single-source-of-truth document tracking every challenge from initial citizen submission to final outcome assessment.
- **Problem Qualification Gate**: A mandatory human decision step classifying problems into `SERVICE`, `CLARIFY`, `RESEARCH_REVIEW`, or `INNOVATION_CHALLENGE` routes.
- **Dynamic Readiness Engine**: State verification logic that automatically invalidates `PILOT_READY` status to `REVIEW_REQUIRED` whenever underlying commitments or preconditions break.
- **Outcome Integrity Assurance**: Visual and structural separation between `OperationalStatus` (`PLANNED`, `ACTIVE`, `COMPLETED`, `STOPPED`) and `EvidenceConclusion` (`VALIDATED`, `ITERATE`, `INCONCLUSIVE`).
- **Guided Mission Mode**: On-demand onboarding, role-specific walkthroughs, Mission Navigator progress tracking, and a dedicated 90-second Jury Tour.

---

## 4. Target Stakeholders

NIRNAY supports five primary user groups with strict Role-Based Access Control (RBAC):

1. **Citizens & Innovators**: Report localized societal challenges, upload ground-truth evidence, and monitor progress transparently.
2. **Government Nodal Reviewers**: Review problem queues, enforce qualification decisions, issue readiness approvals, and authorize pilots.
3. **Higher Education Institutions (HEIs) & Industry Partners**: Register R&D capabilities, evaluate candidate matches, issue formal resource commitments, and record evidence plans.
4. **Platform Administrators**: Manage organizational registries, oversee actor onboarding, and monitor system security/audit logs.
5. **Evaluation Jury & Auditors**: Conduct independent decision reviews, inspect audit receipts, run synthetic verification scenarios, and validate governance integrity.

---

## 5. Technology Stack & Architecture Overview

NIRNAY is engineered as a modern, decoupled web platform:
- **Frontend**: Next.js `16.3.5` with React `19.2.8`, TailwindCSS `^4`, TypeScript `^5`, and client-side multilingual support (8 languages).
- **Backend API**: FastAPI `0.116.1` with SQLAlchemy `2.0.43`, Pydantic `2.11.7`, and Alembic migration tracking (`001` through `013`).
- **Database**: PostgreSQL 15+ using `psycopg3` driver and Argon2id session security.
- **AI Integration**: Non-authoritative Gemini API integration for structured text extraction, duplicate detection, and qualification suggestions.

---

## 6. Current Status & Verification

- **Repository**: [https://github.com/CREATORRADHEY/Nirnay-SIH26043](https://github.com/CREATORRADHEY/Nirnay-SIH26043)
- **Current Release Tag**: `sih26043-final-v1.1`
- **Current Main SHA**: `0d4dd7179040c06497f5a9e33bfdf9b0cbe8ec4e`
- **Backend Test Status**: `170 / 170 passed`
- **Frontend Test Status**: `31 / 31 passed`
- **Typecheck & Build**: `0 errors`, 32/32 routes compiled.
