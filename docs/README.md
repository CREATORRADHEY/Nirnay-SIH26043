# NIRNAY Documentation System

Welcome to the canonical documentation library for **NIRNAY (SIH26043)** — *Right Problem. Ready Pilot. Proven Outcome.*

This documentation suite provides detailed specifications of the product thesis, system architecture, domain models, security controls, AI boundaries, deployment procedures, validation results, and jury presentation playbooks.

---

## 🚀 Navigation & Index

### 00. Overview
- 📄 [Project Overview](./00-overview/PROJECT_OVERVIEW.md) — Problem context, target users, Jharkhand/Indian civic scope, core product lifecycle, and status.
- 📄 [Problem Statement & Context](./00-overview/PROBLEM_STATEMENT_AND_CONTEXT.md) — In-depth breakdown of SIH26043 challenge requirements and civic disconnects.
- 📄 [Product Thesis](./00-overview/PRODUCT_THESIS.md) — Conceptual framework: Facts vs. Decisions vs. Readiness vs. Outcomes.

### 01. Product & Workflows
- 📄 [User Roles & Stakeholders](./01-product/USER_ROLES_AND_STAKEHOLDERS.md) — Persona definitions, RBAC capabilities, and restricted actions for Citizen, Government, HEI, Admin, and Jury roles.
- 📄 [End-to-End Workflow](./01-product/END_TO_END_WORKFLOW.md) — Detailed 9-stage lifecycle from challenge report to outcome integrity verification.
- 📄 [Challenge Passport](./01-product/CHALLENGE_PASSPORT.md) — Single source of truth compiling all lifecycle history, decisions, commitments, and evidence.
- 📄 [Guided Mission Mode](./01-product/GUIDED_MISSION_MODE.md) — Role-aware guided tours, Mission Navigator, Page Context, and 90-second Jury Tour.

### 02. System Architecture & Domain Model
- 📄 [System Architecture](./02-system/SYSTEM_ARCHITECTURE.md) — End-to-end component topology (Vercel Next.js → Render FastAPI → PostgreSQL).
- 📄 [Domain Model](./02-system/DOMAIN_MODEL.md) — Canonical state contracts, domain enums, state transition rules, and invalidation triggers.
- 📄 [Database & Data Model](./02-system/DATABASE_AND_DATA_MODEL.md) — ER diagram, SQLAlchemy models, and Alembic migration sequence (001 to 013).
- 📄 [API Architecture](./02-system/API_ARCHITECTURE.md) — OpenAPI endpoint groups, request schemas, authorization patterns, and error handling.
- 📄 [Frontend Architecture](./02-system/FRONTEND_ARCHITECTURE.md) — Next.js App Router structure, custom hooks, i18n translation framework, and state management.

### 03. AI Architecture & Boundaries
- 📄 [AI Architecture](./03-ai/AI_ARCHITECTURE.md) — Gemini provider integration, structured extraction, duplicate detection, and qualification suggestions.
- 📄 [AI Authority Boundaries](./03-ai/AI_AUTHORITY_BOUNDARIES.md) — Strict governance guardrails (*AI Proposes → Human Authorizes*) and non-authoritative constraints.
- 📄 [AI Evaluation & Fallback](./03-ai/AI_EVALUATION_AND_FALLBACK.md) — Offline evaluation dataset, LLM-as-judge benchmark results, and AI-disabled fallback mechanisms.

### 04. Security & Governance
- 📄 [Security Model](./04-security/SECURITY_MODEL.md) — Defense-in-depth security topology, data minimization, and auditability.
- 📄 [Auth, RBAC & Session Security](./04-security/AUTH_RBAC_CSRF.md) — Argon2id password hashing, HttpOnly session cookies, CSRF protection, and IDOR isolation.
- 📄 [Privacy & Data Minimization](./04-security/PRIVACY_AND_DATA_MINIMIZATION.md) — PII protection, redaction pipelines, and compliance standards.

### 05. Deployment & Operations
- 📄 [Local Development Guide](./05-deployment/LOCAL_DEVELOPMENT.md) — Step-by-step setup for running API backend, frontend web app, and database locally.
- 📄 [Production Deployment](./05-deployment/PRODUCTION_DEPLOYMENT.md) — Vercel and Render deployment topology, CORS configuration, and SSL/HTTPS settings.
- 📄 [Environment Configuration](./05-deployment/ENVIRONMENT_CONFIGURATION.md) — Full reference of environment variable names, fallback settings, and production flags.
- 📄 [Operations & Healthchecks](./05-deployment/OPERATIONS_AND_HEALTHCHECKS.md) — Live monitoring endpoints, database connectivity checks, and Render cold-start warm-up procedures.

### 06. Validation & Test Results
- 📄 [Testing Strategy](./06-validation/TESTING_STRATEGY.md) — Overview of multi-layer testing architecture (Pytest, Node test runner, Playwright E2E, tsc typecheck).
- 📄 [Validation Results](./06-validation/VALIDATION_RESULTS.md) — Empirical evidence breakdown of 170 backend tests, 31 frontend tests, typecheck, and build verification.
- 📄 [Hero Scenarios](./06-validation/HERO_SCENARIOS.md) — Formal documentation of Scenario A (Readiness Invalidation) and Scenario B (Outcome Integrity).
- 📄 [Usability & UX Validation](./06-validation/USABILITY_AND_UX_VALIDATION.md) — Controlled usability study methodology, task completion metrics, and UX guidelines.

### 07. Demo & Jury Playbooks
- 📄 [Demo Guide](./07-demo/DEMO_GUIDE.md) — 3-minute and 5-minute live demonstration flows for hackathon presentations.
- 📄 [Jury Walkthrough](./07-demo/JURY_WALKTHROUGH.md) — Interactive Jury Evaluation Workspace walkthrough and synthetic scenario execution.
- 📄 [Demo Accounts](./07-demo/DEMO_ACCOUNTS.md) — Pre-seeded role accounts for Government, Citizen, HEI, Industry, and Admin personas.
- 📄 [Failure Fallback Plan](./07-demo/FAILURE_FALLBACK_PLAN.md) — Risk mitigation procedures for live presentations (network slowdowns, cold starts, API outages).

### 08. Release & Roadmap
- 📄 [Release History](./08-release/RELEASE_HISTORY.md) — Full git history milestone breakdown from initial foundation to final release tags.
- 📄 [Current Release](./08-release/CURRENT_RELEASE.md) — Current SHA metadata, tag specifications, and environment verification.
- 📄 [Known Limitations](./08-release/KNOWN_LIMITATIONS.md) — Transparent declaration of MVP scope, ephemeral storage behavior, and hosting boundaries.
- 📄 [Product Roadmap](./08-release/ROADMAP.md) — Post-hackathon deployment roadmap, state SSO integration, and scalable S3 storage migration.

---

## 🎯 Recommended Reading Order

### For Evaluators & Jury Members
1. [Project Overview](./00-overview/PROJECT_OVERVIEW.md)
2. [Product Thesis](./00-overview/PRODUCT_THESIS.md)
3. [Jury Walkthrough](./07-demo/JURY_WALKTHROUGH.md)
4. [Hero Scenarios](./06-validation/HERO_SCENARIOS.md)
5. [AI Authority Boundaries](./03-ai/AI_AUTHORITY_BOUNDARIES.md)

### For Software Engineers & Developers
1. [Local Development Guide](./05-deployment/LOCAL_DEVELOPMENT.md)
2. [System Architecture](./02-system/SYSTEM_ARCHITECTURE.md)
3. [Domain Model](./02-system/DOMAIN_MODEL.md)
4. [Database & Data Model](./02-system/DATABASE_AND_DATA_MODEL.md)
5. [Testing Strategy](./06-validation/TESTING_STRATEGY.md)
