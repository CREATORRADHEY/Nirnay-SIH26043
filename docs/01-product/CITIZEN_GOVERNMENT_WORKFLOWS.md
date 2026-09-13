# NIRNAY — Citizen & Government Operational Workflows (P2)

## 1. Overview
Production Phase P2 transforms NIRNAY into an active, operational platform for two key primary stakeholders:
- **Citizens (`COMMUNITY_REPORTER`)**: Local reporters, village leaders, and district citizens submitting real-world problem statements, evidence attachments, and tracking resolution status.
- **Government (`GOVERNMENT_REVIEWER`, `GOVERNMENT_ADMIN`)**: Department officers and review committee members reviewing incoming challenges, requesting formal clarifications, rendering qualification decisions, matching HEI research capabilities, and authorizing pilot projects.

---

## 2. Citizen Workflows (`/app/challenges/*`)

### 2.1 Challenge Submission Wizard
- **Route**: `/app/challenges/new`
- **5-Step Form Process**:
  1. **Narrative & Domain**: Problem Title, Domain (Water, Health, Agriculture, Education, Infrastructure, Energy), Detailed Description, Affected Population.
  2. **Location Context**: District, Block, Panchayat, Gram Sabha context in Jharkhand.
  3. **Impact & Urgency**: Affected population estimate, Urgency Level (LOW, MEDIUM, HIGH, CRITICAL).
  4. **Evidence & Attachments**: File upload (up to 10MB) for water lab test reports, ground photos, official complaints.
  5. **Review & Submit**: Final preview of submitted Challenge Passport.

### 2.2 Citizen Challenge Explorer & Status Tracking
- **Route**: `/app/challenges` and `/app/me/challenges`
- Displays active citizen submissions with real-time status indicators:
  - `UNREVIEWED`: Newly submitted challenge awaiting initial intake.
  - `UNDER_REVIEW`: Reviewer actively auditing evidence and context.
  - `CLARIFICATION_REQUESTED`: Reviewer submitted formal question requiring citizen input.
  - `QUALIFIED`: Formally approved for institutional matchmaking and pilot readiness.
  - `REJECTED`: Out of scope or invalid submission.

### 2.3 Clarification Response & Evidence Upload Thread
- **Route**: `/app/challenges/[challengeId]`
- Citizens view questions posted by Government Reviewers, type structured responses, and upload additional clarifying evidence files.

---

## 3. Government Workflows (`/app/review/*`)

### 3.1 Government Intake Queue
- **Route**: `/app/review`
- Multi-dimensional queue filtering by:
  - District (24 Jharkhand districts)
  - Sectoral Domain
  - Review State (`UNREVIEWED`, `UNDER_REVIEW`, `CLARIFICATION_REQUESTED`, `QUALIFIED`, `REJECTED`)
  - Keyword Search (Title, Description, Panchayat)
- Queue statistics bar showing counts for Unreviewed, Under Review, Clarification Requested, Qualified, and Rejected challenges.

### 3.2 Decision Workbench
- **Route**: `/app/review/[challengeId]`
- Consolidated 6-panel workbench for government officers:
  1. **Narrative Panel**: Problem title, summary, district, block, panchayat, population, urgency.
  2. **Evidence Audit Panel**: Stream and download attached evidence files with original mime-types.
  3. **Clarification Thread Panel**: Issue official clarification queries to the citizen reporter and track responses.
  4. **Qualification Routing**: Select route (`DIRECT_PILOT`, `HEI_R_AND_D`, `INDUSTRY_SCALE`, `REJECTED`) and provide mandatory rationale.
  5. **HEI Candidate Matching**: Match HEI research departments, select lead institutional partners, and record match criteria.
  6. **Readiness Authorization**: Review pilot condition matrices and issue formal human `PILOT_READY` authorizations.

---

## 4. Notifications & Cross-Role Lifecycle

### 4.1 In-App Notification Center
- **Route**: `/app/notifications`
- Triggered automatically on key workflow events:
  - Reviewer issues Clarification Request -> Citizen receives notification.
  - Citizen responds to Clarification -> Reviewer receives notification.
  - Qualification decision rendered -> Citizen receives status update notification.
  - Readiness authorized -> Relevant HEI & Industry partners receive notification.

---

## 5. Security & Session Integrity
- All mutations enforce server-side session identity (`current_actor`).
- IDOR protections ensure citizens can only upload evidence to their own challenges or respond to clarifications issued on their submissions.
- Strict RBAC restricts Government Review Queue and Decision Workbench to `GOVERNMENT_REVIEWER` and `GOVERNMENT_ADMIN` roles.
