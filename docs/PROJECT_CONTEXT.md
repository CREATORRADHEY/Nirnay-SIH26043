# NIRNAY — Project Context

**Project Name:** NIRNAY (Societal Innovation Collaboration & Readiness Platform)  
**Problem Statement ID:** SIH26043  
**Organization:** Department of Higher & Technical Education, Government of Jharkhand  
**Team:** CREATORZZZ  
**Tagline:** Right Problem. Ready Pilot. Proven Outcome.

---

## 1. Project Purpose & Product Thesis

NIRNAY is a technology-enabled platform designed to crowdsource community-driven societal challenges across Jharkhand and facilitate structured collaboration between citizens, academic institutions (HEIs), industry partners, and government bodies.

### Locked Product Thesis (DOC00 v2.0)
NIRNAY is **NOT** merely a complaint portal or a simple grievance router (such as CPGRAMS). Its primary focus is **decision quality** across the innovation lifecycle through two core decision gates:

1. **Problem Qualification Gate (Upstream Core):**  
   *Question:* Should this societal problem enter an innovation/research pathway?  
   Filters out routine operational grievances (routed to existing service portals) and poorly specified reports before assigning academic resources.

2. **Pilot Readiness & Learning Engine (Downstream Core):**  
   *Question:* Is the selected challenge actually ready for a field pilot, and what did the pilot evidence prove?  
   Ensures pilots launch only when ownership, field permissions, accepted institutional commitments, and measurable evidence metrics are verified.

> **Canonical Principle:**  
> *"Assignment is not readiness. Completion is not impact. Har genuine problem innovation problem nahi hoti. Har innovation problem pilot-ready nahi hoti. Aur har completed pilot impact prove nahi karta."*

---

## 2. Official Scope & Core Modules

The official SIH26043 problem statement requires a comprehensive platform covering seven functional areas:

1. **Citizen Engagement Module:** Enables citizens, community groups, Panchayati Raj Institutions (PRIs), Urban Local Bodies (ULBs), and departments to submit problems with location, media evidence, and supporting details.
2. **AI-Assisted Problem Management Module:** Categorizes, prioritizes, deduplicates, and drafts suggested routing for validated challenges.
3. **University Collaboration Module:** Enables Higher Education Institutions (HEIs) to review assigned challenges, form multidisciplinary project teams, assign faculty mentors, and submit proposals.
4. **Industry Partnership Module:** Facilitates participation by industries, startups, MSMEs, CSR organizations, and research hubs for mentorship, funding, prototyping, testing, and pilot implementation.
5. **Project Lifecycle Management System:** Monitors milestones, deliverables, approvals, documentation, testing outcomes, and pilot execution.
6. **Visual Analytics Dashboard:** Real-time insights on challenge submissions, institutional participation, industry engagement, project progress, and measurable social outcomes across districts.
7. **Notification & Communication System:** Multi-stakeholder alerts and updates throughout the project lifecycle.

---

## 3. Accountable Actors (DOC01 §1.1)

- **Reporter / Source:** Submits problem reports and evidence. Identifies source; has no administrative approval authority.
- **Programme Coordinator:** Manages operational review workflows, requests missing evidence, and prepares qualification/readiness packets.
- **Problem Owner / Local Authority:** Confirms jurisdiction, local administrative support, and field permissions for pilots.
- **HEI / Faculty / Resource Custodian:** Evaluates technical feasibility, forms student/faculty teams, and accepts/declines scoped commitments.
- **Industry / CSR / Sponsor Partner:** Offers mentorship, funding, prototyping facilities, or field testing support.
- **Evaluator:** Reviews Pilot Evidence Plans, monitors metrics, and evaluates outcome evidence.
- **Policy Approver:** Approves and versions mandatory readiness rubrics and platform guidelines.

---

## 4. End-to-End Lifecycle

```
[Problem Intake] 
       │
       ▼
[Problem Qualification Gate] ───(SERVICE)──────────► External Grievance / Dept Portal
       │                      ───(CLARIFY)──────────► Request Evidence from Reporter
       │                      ───(RESEARCH_REVIEW)─► HEI Research Baseline
       ▼ (INNOVATION_CHALLENGE)
[HEI & Industry Allocation / Proposals]
       │
       ▼
[Commitment & Dependency Integrity Engine] ──(Scope/Dependency Change)──► Auto Re-Open
       │                                                                      │
       ▼ (All Conditions Satisfied)                                           │
[Pilot Readiness Gate] ◄──────────────────────────────────────────────────────┘
       │
       ▼ (Authorized Human Sign-off)
[PILOT_READY]
       │
       ▼
[Pilot Execution & Evidence Plan Tracking] (PLANNED ➔ ACTIVE ➔ COMPLETED / STOPPED)
       │
       ▼
[Outcome Review & Learning Engine] (VALIDATED / ITERATE / INCONCLUSIVE)
```

---

## 5. System Architecture & V1 Scope

### Monorepo Architecture
- **Backend:** FastAPI + Pydantic v2 + SQLAlchemy v2 + Alembic + PostgreSQL 16 (`apps/api`). Modular monolith structure (`core`, `models`, `schemas`, `repositories`, `services`, `routers`, `rules`, `integrations`).
- **Frontend:** Next.js (App Router) + React + TypeScript (Strict) + Tailwind CSS v4 (`apps/web`).
- **Shared Contracts:** Contract package (`packages/contracts`) for canonical enums and shared schemas.

### V1 Scope
Core web application with simulated multi-actor role switching, structured qualification gate, versioned commitment tracking, automated dependency invalidation, pilot readiness authorization, structured evidence plan tracking, and outcome logging.

### Non-Goals for V1
- CPGRAMS / grievance intake replacement
- Procurement or live financial funding transaction engine
- Autonomous AI approval or impact adjudication
- Real government SSO/OAuth integration (simulated demo roles used in V1)
- Unverified claims of real-world government deployment

---

## 6. Current Validation Status (TRL3 Report)

- **Technical Validation Date:** 10 September 2026.
- **Validation Basis:** 220 synthetic test packets (120 P1 qualification cases, 40 P2 commitment scenarios with 120 mutations, 60 P3 evidence packets).
- **Core TRL3 Decision:** **SIMPLIFY**. Implement a competent, clean structured workflow MVP for qualification and readiness review, retaining the custom Commitment & Dependency Integrity mechanism (P2) as an isolated, verified core engine.
- **Evidence Boundaries:** Independent human gold standards, live field pilots, real government API integrations, and measured human time savings remain to be validated in future production phases.
