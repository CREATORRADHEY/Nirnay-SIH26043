# P5.0 Product Route Audit & Challenge Passport Inventory

> **Project**: NIRNAY — Societal Innovation Collaboration & Readiness Platform (SIH26043)  
> **Phase**: P5.0 Final Product Cleanup & Foundation Audit  
> **Branch**: `feature/p5-product-cleanup`  
> **Baseline Commit**: `8690036`

---

## 1. Full Production Route Inventory (`apps/web/src/app`)

| Route Path | Classification | Intended Role(s) | Page Purpose | Backend API Used | Data Mode | Primary CTA | Auth Guard | Role Guard | Duplicate Shell? |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/` | PUBLIC | Anyone | Production Landing Page | `/api/v1/challenges` | Live DB / Fallback | Start Review | No | No | No (Landing Site Shell) |
| `/login` | AUTH | Anyone | User Sign-In (Email & Mobile OTP) | `/api/v1/auth/login`, `/api/v1/auth/mobile-otp/*` | Live API / Resilient Fallback | Sign In | No | No | No |
| `/register` | AUTH | Anyone | User Registration | `/api/v1/auth/register` | Live API | Create Account | No | No | No |
| `/forgot-password` | AUTH | Anyone | Password Reset Request | `/api/v1/auth/password-reset` | Live API | Send Reset Link | No | No | No |
| `/challenges` | PUBLIC | Anyone | Public Challenge Passport Directory | `/api/v1/challenges` | Live DB | View Passport | No | No | No |
| `/challenges/[challengeId]` | PUBLIC | Anyone | Public Challenge Passport View | `/api/v1/challenges/{id}` | Live DB | Explore Commitment | No | No | No |
| `/pilots/[pilotId]` | PUBLIC / GOVT | Anyone | Field Pilot Workspace | `/api/v1/pilots/{id}` | Live DB | Inspect Outcome | Optional | Optional | No |
| `/demo` | INTERNAL_DEMO | Jury / Presenter | Jury Rehearsal Launchpad | Client State / Scenarios | Synthetic Scenarios | Open Scenario A | Protected (404 in Prod) | Protected | Isolated |
| `/app` | GOVERNMENT | All Roles | Authenticated Main Dashboard | `/api/v1/auth/me`, `/api/v1/challenges` | Live DB | Review Challenges | Yes (`/login`) | Yes | Main App Shell (`ProductShell`) |
| `/app/challenges` | GOVERNMENT / HEI | Govt, HEI, MSME | Authenticated Challenge List | `/api/v1/challenges` | Live DB | Create Challenge | Yes (`/login`) | Yes | Main App Shell |
| `/app/challenges/new` | CITIZEN / GOVT | Citizen, Govt | Challenge Intake Form | `/api/v1/challenges` | Live DB | Submit Challenge | Yes (`/login`) | Yes | Main App Shell |
| `/app/challenges/[challengeId]`| GOVERNMENT | Govt, HEI | Challenge Management & Audit | `/api/v1/challenges/{id}` | Live DB | Record Qualification | Yes (`/login`) | Yes | Main App Shell |
| `/app/qualification` | GOVERNMENT | Govt Nodal Officer | Qualification Queue | `/api/v1/qualification` | Live DB | Qualify Challenge | Yes (`/login`) | Yes (`GOVERNMENT_*`) | Main App Shell |
| `/app/review` | GOVERNMENT | Govt Nodal Officer | Review Queue | `/api/v1/challenges` | Live DB | Review Issue | Yes (`/login`) | Yes (`GOVERNMENT_*`) | Main App Shell |
| `/app/review/[challengeId]` | GOVERNMENT | Govt Nodal Officer | Challenge Review Workbench | `/api/v1/challenges/{id}` | Live DB | Submit Review | Yes (`/login`) | Yes (`GOVERNMENT_*`) | Main App Shell |
| `/app/hei-matching` | HEI / GOVT | HEI Lead, Govt | HEI Matching & Capability Registration | `/api/v1/hei-matching` | Live DB | Commit Resources | Yes (`/login`) | Yes (`HEI_*`, `GOVT_*`) | Main App Shell |
| `/app/commitments` | HEI / INDUSTRY | HEI, MSME, Govt | Institutional Commitments Roster | `/api/v1/commitments` | Live DB | Update Commitment | Yes (`/login`) | Yes | Main App Shell |
| `/app/readiness` | GOVERNMENT | Govt Nodal Officer | Pilot Readiness Governance | `/api/v1/readiness` | Live DB | Authorize Pilot | Yes (`/login`) | Yes (`GOVERNMENT_*`) | Main App Shell |
| `/app/pilots` | GOVERNMENT / HEI | Govt, HEI, MSME | Field Pilot Management | `/api/v1/pilots` | Live DB | Advance Lifecycle | Yes (`/login`) | Yes | Main App Shell |
| `/app/outcomes` | GOVERNMENT | Govt Evaluator | Outcome Evaluation Workspace | `/api/v1/outcomes` | Live DB | Assess Outcome | Yes (`/login`) | Yes (`GOVERNMENT_*`) | Main App Shell |
| `/app/organizations` | GOVERNMENT / ADMIN | Govt Admin, Platform Admin | Organization Governance | `/api/v1/organizations` | Live DB | Manage Org | Yes (`/login`) | Yes (`*ADMIN`) | Main App Shell |
| `/app/notifications` | AUTH | All Roles | User Notifications | `/api/v1/notifications` | Live DB | Mark Read | Yes (`/login`) | Yes | Main App Shell |
| `/app/account` | AUTH | All Roles | Account Settings | `/api/v1/account` | Live DB | Save Profile | Yes (`/login`) | Yes | Main App Shell |
| `/app/account/security` | AUTH | All Roles | Security Settings | `/api/v1/account/security` | Live DB | Change Password | Yes (`/login`) | Yes | Main App Shell |
| `/app/admin` | PLATFORM_ADMIN | Platform Admin | System Admin Overview | `/api/v1/admin/telemetry` | Live DB | View System Health | Yes (`/login`) | Yes (`PLATFORM_ADMIN`)| Main App Shell |
| `/app/admin/users` | PLATFORM_ADMIN | Platform Admin | User Directory & Role Delegation | `/api/v1/admin/users` | Live DB | Modify Role | Yes (`/login`) | Yes (`PLATFORM_ADMIN`)| Main App Shell |
| `/app/admin/organizations`| PLATFORM_ADMIN | Platform Admin | Org Status Governance | `/api/v1/admin/organizations` | Live DB | Approve Org | Yes (`/login`) | Yes (`PLATFORM_ADMIN`)| Main App Shell |
| `/app/admin/audit` | PLATFORM_ADMIN | Platform Admin | System Security Audit Logs | `/api/v1/admin/audit-logs` | Live DB | Filter Logs | Yes (`/login`) | Yes (`PLATFORM_ADMIN`)| Main App Shell |
| `/app/admin/ai` | PLATFORM_ADMIN | Platform Admin | AI Boundary Telemetry Logs | `/api/v1/admin/ai-logs` | Live DB | Inspect Logs | Yes (`/login`) | Yes (`PLATFORM_ADMIN`)| Main App Shell |

---

## 2. Challenge Passport Data Audit & Tab Source-of-Truth

| Passport Tab | Data Source | Source of Truth Entity | Fallback Behavior | Known Gaps / Audit Findings |
| :--- | :--- | :--- | :--- | :--- |
| **Overview** | `/api/v1/challenges/{id}` | `challenges` | Offline demo record if API unavailable | Clean: Data binds directly to DB attributes |
| **Evidence** | `/api/v1/challenges/{id}/evidence` | `challenge_evidence` | Empty list | Clean: Verified file metadata binding |
| **Clarifications** | `/api/v1/challenges/{id}/clarifications` | `challenge_clarifications` | Empty list | Clean: Q&A audit trail |
| **Qualification** | `/api/v1/qualification/history?challenge_id={id}` | `qualification_decisions` | Historic version list | Clean: Explicit actor & version binding |
| **HEI Matching** | `/api/v1/hei-matching/candidates?challenge_id={id}` | `hei_candidates` | Candidate list | Clean: Rationale and capacity dossier |
| **Commitments** | `/api/v1/commitments?challenge_id={id}` | `hei_commitments` | Commitment list | Clean: `expected_version` concurrency locking |
| **Pilot Readiness** | `/api/v1/readiness/latest?challenge_id={id}` | `readiness_decisions` | Readiness decision | Clean: Invalidation engine parity (`REVIEW_REQUIRED`) |
| **Pilots** | `/api/v1/pilots?challenge_id={id}` | `pilots` | Pilot records | Clean: Operational status decoupling |
| **Outcome** | `/api/v1/pilots/{id}/outcome` | `outcome_assessments` | Outcome record | Clean: `INCONCLUSIVE` default guard |
| **History** | `/api/v1/audit-trail?entity_id={id}` | `audit_logs` | Version snapshots | Clean: Append-only immutable log |
