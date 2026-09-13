# NIRNAY Production Screen Map & User Journey Matrix

## Status Overview
- **PRODUCTION FOUNDATION P1**: SECURITY CLOSED & COMPLETE
- **P2 (Citizen + Government Workflows)**: IMPLEMENTED & VERIFIED (125/125 PASS)
- **P3 (HEI + Industry Workflows)**: NEXT
- **P4 (Platform Hardening & Notifications)**: PLANNED

---

## 1. Authentication & Security Screens (P1 COMPLETE)
- `/login`: Production sign-in screen with HttpOnly session cookie authentication and CSRF protection. [P1 COMPLETE]
- `/register`: Production account creation with display name, email, password, and platform role. [P1 COMPLETE]
- `/forgot-password`: Self-service password reset request workflow (enumeration safe). [P1 COMPLETE]
- `/app/account/security`: Active session management and remote session revocation portal. [P1 COMPLETE]

---

## 2. Authenticated Application Shell & Role Dashboards (P1 COMPLETE)
- `/app`: Multi-role Production Dashboard (`/api/v1/dashboard/summary`). [P1 COMPLETE]
  - Community Reporter: Submitted challenges, pilot qualification progress, District intake metrics.
  - Government Reviewer: Pending qualification queue, readiness review required, ground pilots.
  - HEI Member: University commitments, active research pilots, matching candidates.
  - Industry Member: Co-funding commitments, equipment CSR partnerships.
  - Platform Admin: Registered organizations, pending approvals, user audit logs.
- `/app/organizations`: Organization onboarding, multi-tenant directory, and member invitation portal. [P1 COMPLETE]
- `/app/account`: User profile, organization memberships, role badges, and credential management. [P1 COMPLETE]

---

## 3. Citizen & Government Workflows (P2 COMPLETE & TESTED)
- `/app/challenges/new`: 5-Step Citizen Challenge Submission Wizard (Narrative, Location Context, Impact & Urgency, Evidence Upload up to 10MB, Final Review). [P2 COMPLETE]
- `/app/challenges`: Citizen Challenge Explorer & Status Tracker with real-time intake state badges. [P2 COMPLETE]
- `/app/challenges/[challengeId]`: Citizen Challenge Detail & Clarification Thread (View questions, submit responses, upload follow-up evidence). [P2 COMPLETE]
- `/app/review`: Government Intake Queue with multi-dimensional filtering (District, Sectoral Domain, Review State, Keyword Search) & Statistics. [P2 COMPLETE]
- `/app/review/[challengeId]`: Government Decision Workbench (6-Panel Executive Interface: Narrative, Evidence Audit, Clarification Query Issuer, Qualification Routing, HEI Candidate Matching, Readiness Authorization). [P2 COMPLETE]
- `/app/notifications`: In-App Notification Center with real-time badges, event-driven triggers, and mark-as-read controls. [P2 COMPLETE]
- `/app/qualification`: Qualified Innovation Challenges directory. [P2 COMPLETE]
- `/app/hei-matching`: Higher Educational Institutions directory, research capabilities, and candidate matching workspace. [P2 COMPLETE]
- `/app/readiness`: Pilot Readiness Workspace & PILOT_READY human authorizations. [P2 COMPLETE]
- `/app/pilots`: Active Pilot Projects & Operational State Transitions. [P2 COMPLETE]
- `/app/outcomes`: Outcome Assessment Workspace & Factual Evidence Audit. [P2 COMPLETE]

---

## 4. Public Landing & Base Experience
- `/`: Locked NIRNAY landing page.
- `/challenges`: Public Challenge Explorer.
- `/challenges/[challengeId]`: Public Challenge Passport view.
- `/pilots/[pilotId]`: Public Pilot Detail view.
- `/demo`: Isolated Jury Demo & Deterministic Scenario Runner.
