# NIRNAY Production Screen Map & User Journey Matrix

## Status Overview
- **PRODUCTION FOUNDATION P1**: SECURITY CLOSED
- **P2 (Citizen + Government Workflows)**: NEXT
- **P3 (HEI + Industry Workflows)**: PLANNED
- **P4 (Platform Hardening & Notifications)**: PLANNED

---

## 1. Authentication & Security Screens (P1 SECURITY CLOSED)
- `/login`: Production sign-in screen with HttpOnly session cookie authentication and CSRF protection. [P1 COMPLETE]
- `/register`: Production account creation with display name, email, password, and platform role. [P1 COMPLETE]
- `/forgot-password`: Self-service password reset request workflow (enumeration safe). [P1 COMPLETE]
- `/app/account/security`: Active session management and remote session revocation portal. [P1 COMPLETE]

---

## 2. Authenticated Application Shell & Role Dashboards (P1 SECURITY CLOSED)
- `/app`: Multi-role Production Dashboard (`/api/v1/dashboard/summary`). [P1 COMPLETE]
  - Community Reporter: Submitted challenges, pilot qualification progress, District intake metrics.
  - Government Reviewer: Pending qualification queue, readiness review required, ground pilots.
  - HEI Member: University commitments, active research pilots, matching candidates.
  - Industry Member: Co-funding commitments, equipment CSR partnerships.
  - Platform Admin: Registered organizations, pending approvals, user audit logs.
- `/app/organizations`: Organization onboarding, multi-tenant directory, and member invitation portal. [P1 COMPLETE]
- `/app/account`: User profile, organization memberships, role badges, and credential management. [P1 COMPLETE]

---

## 3. Core Product Workflows (Preserved MVP Base)
- `/`: Locked landing page.
- `/challenges`: Challenge Explorer & Filtering.
- `/challenges/[challengeId]`: Challenge Passport & Multi-tab evidence/qualification workflow.
- `/pilots/[pilotId]`: Pilot Detail & Evidence Plan / Outcome Assessment.
- `/demo`: Isolated Jury Demo & Deterministic Scenario Runner (Disabled in `APP_ENV=production`).
