# NIRNAY Platform — Master Step-by-Step Manual QA & Jury Testing Guide

This document provides the definitive, production-grade manual testing guide for the **NIRNAY Platform (SIH26043)**. It includes master credential mappings, unauthenticated explorer checks, role-based governance workflows, and Golden Jury demonstration scenarios.

---

## 🔑 Master Credentials Reference

| Role | Name & Entity | Email | Password | Access Rights & Workflows |
| :--- | :--- | :--- | :--- | :--- |
| **State Nodal Reviewer** | Ananya Singh (`GOVERNMENT_ADMIN`) | `gov@nirnay.gov.in` | `Password123!` | Executive Dashboard, Review Queue, Qualification, HEI Matching, Readiness, Pilots, Outcomes, Organizations |
| **Nodal Reviewer (Jury Demo)** | Nodal Officer (`GOVERNMENT_REVIEWER`) | `reviewer@nirnay.gov.in` | `Password123!` | Reviewer Workbench, Audit Trail & Evaluation |
| **HEI Admin** | Dr. Ramesh Sharma (`HEI_ADMIN` • BIT Mesra) | `hei@bitmesra.ac.in` | `Password123!` | HEI Capability Matching Workbench, Institutional Commitments Register |
| **Industry Partner** | CleanWater Tech (`INDUSTRY_ADMIN`) | `industry@cleanwater.co.in` | `Password123!` | Industry Commitments & Resource Pledges |
| **Citizen Reporter** | Aditi Verma (`COMMUNITY_REPORTER`) | `citizen@ranchi.gov.in` | `Password123!` | Challenge Intake Reporting & Evidence Uploads |
| **Platform Administrator** | System Admin (`PLATFORM_ADMIN`) | `admin@nirnay.gov.in` | `Password123!` | System Governance, User RBAC Management, AI Telemetry & Audit Logs |

---

## 🌐 Phase 1: Public Unauthenticated Testing (Landing & Explorer)

### Step 1.1: Homepage Overview & Interactive Product Preview

1. **Access Application**:
   Open browser to `http://localhost:3000/`.

2. **Header Navigation Verification**:
   - Click **Product**, **Workflow**, **Stakeholders**, **Evidence**, **Pilot Readiness**, **Resources**, **About** — verify smooth scroll anchoring and routing.
   - Click **Search icon** button in header.
   - Click **View Demo** $\rightarrow$ verifies navigation to `/demo`.
   - Click **Start Review** $\rightarrow$ verifies navigation to `/app` (or redirects to `/login` if unauthenticated).

3. **Interactive 3D Product Preview Widget (Hero Right Column)**:
   - **3D Tilt Effect**: Hover mouse cursor over the card shell — verify smooth CSS 3D dynamic tilt adjustment.
   - **Floating Accent Badges**: Verify `🛡️ Human Sign-off Authoritative`, `✓ 100% Traceable Evidence Dossier`, and `⚡ AI ADVISORY ONLY` badges render cleanly.
   - **Tab Switching**: Click through all 6 tabs (**Overview**, **Evidence**, **Qualification**, **HEI Match**, **Pilot Plan**, **Outcomes**) — verify dynamic panel content updates without layout collisions.
   - **Sidebar Controls**: Click widget sidebar icons (**Dashboard**, **Challenges**, **Evidence**, **HEI Matching**, **Pilot Readiness**, **Monitoring**, **Reports**) — verify active tab highlight changes.
   - **Widget Search Box**: Type `Ranchi` or `Water` in the widget search input.
   - **Action Links**: Click **View Matches** or **View Details** inside the preview widget.

4. **Homepage Sections Check**:
   - **Workflow Section**: Inspect *Challenge Passport*, *HEI Matching*, and *Pilot Outcome* cards. Click **Explore the Workflow $\rightarrow$**.
   - **Platform Capabilities Grid**: Inspect 6 integrity feature cards (*Bounded AI Assistance*, *Automated Re-evaluation*, *Execution vs Evidence Separation*, *Multi-Role Collaboration*, *Immutable Audit History*, *Public Challenge Passports*).
   - **Jury Scenarios Showcase**: Inspect *Scenario A* and *Scenario B* preview cards.
   - **Ecosystem Banner**: Verify logos for State Governments, HEIs, Research Organisations, Development Partners, and Civil Society.
   - **Call-to-Action Banner**: Click **Start Review Now** and **Explore Interactive Demo**.

---

### Step 1.2: Public Challenge Explorer

1. Navigate to `http://localhost:3000/challenges`.
2. **Filters & Search**:
   - **Filter by District**: Select `Ranchi` or `Hazaribagh`.
   - **Filter by Domain**: Select `Environment` or `Urban Infrastructure`.
   - **Search Input**: Type `Water` or `Waste`.
3. **Challenge Details View**:
   - Click on any challenge card (e.g. *Sustainable Water Management for Semi-Urban Towns*).
   - Verify public view displays Challenge ID, location, domain tags, evidence count, and qualification status.

---

## 🔐 Phase 2: Role-Based Workflow Testing

### Workflow A: Government Nodal Reviewer (`gov@nirnay.gov.in`)

#### Step 2.1: Login & Executive Dashboard
1. Open `http://localhost:3000/login`.
2. Enter Email: `gov@nirnay.gov.in`, Password: `Password123!`. Click **Sign In**.
3. **Dashboard (`/app`)**:
   - Verify header displays **Ananya Singh (State Nodal Reviewer)** with role badge `GOVERNMENT ADMIN`.
   - Inspect key counters: *Active Challenges*, *Qualified Problems*, *Matched HEIs*, *Ready Pilots*, *Outcome Evaluations*.

#### Step 2.2: Review Queue (`/app/review`)
1. Click **Review Queue** in navigation.
2. View pending citizen challenge submissions.
3. Select a challenge to review problem details and initial evidence records.

#### Step 2.3: Problem Qualification Workbench (`/app/qualification`)
1. Click **Qualification** in navigation.
2. Select Challenge: **Ward 12 Waste Challenge** (`c0a80001-0000-4000-8000-000000000001`).
3. **Record Qualification Decision**:
   - **Select Route**: `INNOVATION_CHALLENGE` or `GOVERNMENT_PROJECT`.
   - **Rationale**: Enter `"Qualified for state-supported pilot testing under Urban Waste Initiative."`
   - Click **Record Decision $\rightarrow$** — verifies version `v1` is created with score `88/100`.

#### Step 2.4: HEI Capability Matching Workbench (`/app/hei-matching`)
1. Click **HEI Matching** in navigation.
2. View candidate higher education institutions (*BIT Mesra*, *NIT Jamshedpur*, *IIT Dhanbad*).
3. **Inspect Capability Profile**: Click **View Capability** to check research lab equipment and faculty expertise.
4. **Add Manual Candidate Match**:
   - Click **Add Candidate**.
   - **Select Organization**: *Birla Institute of Technology, Mesra*.
   - **Select Match Method**: `MANUAL`.
   - **Rationale**: Enter `"Matched based on specialized hydro-geological aquifer lab facilities."`
   - Click **Save Candidate**.

#### Step 2.5: Pilot Readiness Workbench (`/app/readiness`)
1. Click **Readiness** in navigation.
2. Inspect readiness conditions (*Environmental Safety Clearance*, *Municipal Field Access*, *Institutional Commitment Dependency*).
3. **Record Readiness Decision**:
   - **Select Status**: `PILOT_READY`.
   - **Rationale**: Enter `"All safety clearances and institutional commitments satisfied."`
   - Click **Authorize Pilot Readiness $\rightarrow$** — verifies state becomes `PILOT_READY v1`.

#### Step 2.6: Pilot Execution Workspace (`/app/pilots`)
1. Click **Pilots** in navigation.
2. Select Active Pilot: **Hazaribagh Vendor Cold Chain Field Pilot** (`b0a80002-0000-4000-8000-000000000006`).
3. **Operational State Lifecycle**:
   - Click **Update Operational State**.
   - **Select State**: Advance from `PLANNED` $\rightarrow$ `ACTIVE` $\rightarrow$ `COMPLETED`.
   - **Rationale**: Enter `"Field pilot testing period completed after 60-day observation window."`
4. **Inspect Evidence Plan**:
   - **Objective**: Solar thermal cooling units evaluation.
   - **Baseline**: 41% of surveyed households.
   - **Denominator**: 240 households.

#### Step 2.7: Outcome Evaluation Workbench (`/app/outcomes`)
1. Click **Outcomes** in navigation.
2. Select Completed Pilot.
3. **Record Evidence Outcome Assessment**:
   - **Select Conclusion**: `INCONCLUSIVE` or `VALIDATED`.
   - **Rationale**: Enter `"Monsoon weather variations reduced solar efficiency during weeks 3-4, requiring extended sample size."`
   - Click **Record Outcome Assessment**.
4. **Verify Integrity Separation**: Note that pilot operational state remains `COMPLETED` while outcome is explicitly recorded as `INCONCLUSIVE` (*Completion $\neq$ Impact*).

---

### Workflow B: HEI Academic Admin (`hei@bitmesra.ac.in`)

#### Step 3.1: Login & HEI Dashboard
1. Sign out and log in with Email: `hei@bitmesra.ac.in`, Password: `Password123!`.
2. Navigation header displays: **Dr. Ramesh Sharma (`HEI_ADMIN` • Birla Institute of Technology, Mesra)**.

#### Step 3.2: Record Institutional Commitment (`/app/commitments`)
1. Navigate to `/app/commitments`.
2. Select Challenge: **Sustainable Water Management for Semi-Urban Towns**.
3. **Pledge Institutional Resources**:
   - **Select Commitment Type**: `TECHNICAL_FACILITY_ACCESS`.
   - **Status**: `ACCEPTED`.
   - **Scope Description**: Enter `"BIT Mesra pledges Water Quality Testing Rig and 2 Research Scholars for 6-month pilot duration."`
   - Click **Pledge Commitment $\rightarrow$** — creates commitment version `v1 ACCEPTED`.

#### Step 3.3: Test Automated Dependency Invalidation Flow
1. Update Commitment status to `WITHDRAWN` (Version `v2 WITHDRAWN`).
2. Log back in as `gov@nirnay.gov.in` $\rightarrow$ navigate to `/app/readiness`.
3. **Observe Automated Invalidation**: Verify readiness status automatically transitions from `PILOT_READY` to `REVIEW_REQUIRED` because the underlying commitment dependency broke.

---

### Workflow C: Citizen / Community Reporter (`citizen@ranchi.gov.in`)

#### Step 4.1: Report New Societal Challenge (`/app/challenges/new`)
1. Sign out and log in with Email: `citizen@ranchi.gov.in`, Password: `Password123!`.
2. Navigation header displays: **Aditi Verma (`COMMUNITY_REPORTER`)**.
3. Navigate to `/app/challenges/new`.
4. **Fill Challenge Intake Form**:
   - **Title**: Fluoride Contamination in Ward 7 Drinking Wells
   - **District**: Ranchi
   - **Domain**: Environment & Public Health
   - **Problem Statement**: Enter `"High concentration of fluoride detected in public tube wells affecting 1,500 residents."`
   - **Population Impacted**: 1,500
   - **Severity**: `HIGH`
5. Click **Submit Challenge Intake**.
6. Verify redirect to `/app/challenges` with newly created challenge listed under **My Challenges**.

---

### Workflow D: Platform Administrator (`admin@nirnay.gov.in`)

#### Step 5.1: System Governance & AI Audit Logs (`/app/admin`)
1. Sign out and log in with Email: `admin@nirnay.gov.in`, Password: `Password123!`.
2. Navigation header displays: **System Administrator (`PLATFORM_ADMIN`)**.
3. **AI Assistance Audit (`/app/admin/ai`)**:
   - Inspect AI query logs, prompt injection safety evaluations, schema compliance metrics, and provider failure fallbacks.
4. **Audit Log Viewer (`/app/admin/audit`)**:
   - View system-wide security audit trail, cryptographic request hashes, and actor attribution logs.
5. **Organization Management (`/app/admin/organizations`)**:
   - Inspect Government, HEI, and Industry organization directories and user memberships.

---

## 🏆 Phase 3: Golden Jury Demo Scenarios

### Scenario A: Dependency Integrity ("Ready can become not ready")

1. Open `http://localhost:3000/demo`.
2. Click **Open Scenario A (Ward 12 Waste Challenge)** or open `/challenges/c0a80001-0000-4000-8000-000000000001`.
3. **Step 1**: Observe Readiness status is `PILOT_READY v1` depending on BIT Mesra Commitment `ACCEPTED`.
4. **Step 2**: Open `/app/commitments` $\rightarrow$ Withdraw commitment (`v2 WITHDRAWN`).
5. **Step 3**: Re-inspect `/app/readiness` $\rightarrow$ Observe automatic status invalidation to `REVIEW_REQUIRED`.
6. **Key Jury Takeaway**: *"NIRNAY preserves audit history while automatically invalidating readiness when underlying commitments break."*

---

### Scenario B: Evidence Integrity ("Completed does not mean proven")

1. Open `http://localhost:3000/demo`.
2. Click **Open Scenario B (Cold Chain Pilot Workspace)** or open `/pilots/b0a80002-0000-4000-8000-000000000006`.
3. **Step 1**: Observe Pilot operational state is `ACTIVE`.
4. **Step 2**: Advance operational state to `COMPLETED`.
5. **Step 3**: Observe that no outcome is auto-generated (*Completion $\neq$ Impact*).
6. **Step 4**: Record human outcome assessment as `INCONCLUSIVE` with denominator rationale.
7. **Key Jury Takeaway**: *"Completed, but not proven. Execution completion is strictly separated from impact claims."*
