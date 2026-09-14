# 🧪 NIRNAY (SIH26043) — Role-Based Manual Testing Guide

> **Live Product**: [https://nirnay-sih-26043-one.vercel.app/](https://nirnay-sih-26043-one.vercel.app/)  
> **API Docs**: [https://nirnay-sih26043.onrender.com/docs](https://nirnay-sih26043.onrender.com/docs)  
> **GitHub Repository**: [https://github.com/CREATORRADHEY/Nirnay-SIH26043](https://github.com/CREATORRADHEY/Nirnay-SIH26043)

---

## 🔑 1. Master Credentials Matrix

You can sign in to NIRNAY at [`https://nirnay-sih-26043-one.vercel.app/login`](https://nirnay-sih-26043-one.vercel.app/login) using any of the role credentials below:

| Role | Email Address | Password | Primary Workbench & Permissions |
| :--- | :--- | :--- | :--- |
| **State Nodal Reviewer (Gov Admin)** | `gov@nirnay.gov.in` | `Password123!` | Full Government Dashboard, Review Queue, Qualification & Pilot Approvals |
| **Nodal Reviewer (Jury Demo)** | `reviewer@nirnay.gov.in` | `Password123!` | Reviewer Workbench & Audit Trail Inspection |
| **HEI Admin (BIT Mesra)** | `hei@bitmesra.ac.in` | `Password123!` | HEI Matching, Lab Capability Registration, Commitment Binding |
| **Industry Partner** | `industry@cleanwater.co.in` | `Password123!` | Industry Commitments, Co-execution, Resource Pledges |
| **Citizen Reporter** | `citizen@ranchi.gov.in` | `Password123!` | Public Challenge Intake, Field Evidence & Issue Submissions |
| **Platform Administrator** | `admin@nirnay.gov.in` | `Password123!` | System Administration, Organization Management & Audit Logs |

---

## 🏛️ 2. Step-by-Step Test Guide by Role

---

### 1️⃣ State Nodal Reviewer (Gov Admin)
- **Credentials**: `gov@nirnay.gov.in` / `Password123!`
- **Access / Workbench**: Full Government Dashboard, Review Queue, Qualification & Pilot Approvals
- **Testing Steps**:
  1. Open [`/login`](https://nirnay-sih-26043-one.vercel.app/login) and log in as `gov@nirnay.gov.in`.
  2. You will be redirected to the **Government Dashboard** (`/app`).
  3. Inspect the **Review Queue** tab showing incoming challenges requiring qualification.
  4. Select a challenge (e.g. *Ward 12 Solid Waste Processing*).
  5. Inspect the **AI Non-Authoritative Advisory Panel** (Risk score & baseline evaluation).
  6. Click **Approve Qualification** (State updates to `QUALIFIED`).
  7. Navigate to **Pilot Readiness**: Review HEI commitments and click **Approve Pilot Readiness** (`v1 PILOT_READY`).

---

### 2️⃣ Nodal Reviewer (Jury Demo)
- **Credentials**: `reviewer@nirnay.gov.in` / `Password123!`
- **Access / Workbench**: Reviewer Workbench & Audit Trail Inspection
- **Testing Steps**:
  1. Open [`/login`](https://nirnay-sih-26043-one.vercel.app/login) and log in as `reviewer@nirnay.gov.in`.
  2. Navigate to the **Reviewer Workbench** (`/app`).
  3. Open a challenge detail page and click the **Audit Trail** tab.
  4. Verify the append-only version history showing state snapshots, actor attribution, and timestamps.
  5. Test **Dependency Invalidation (Scenario A)**: Verify that when an HEI drops commitment, the readiness status automatically updates to **`v2 REVIEW_REQUIRED`**.

---

### 3️⃣ HEI Admin (BIT Mesra)
- **Credentials**: `hei@bitmesra.ac.in` / `Password123!`
- **Access / Workbench**: HEI Matching & Capability Registration
- **Testing Steps**:
  1. Open [`/login`](https://nirnay-sih-26043-one.vercel.app/login) and log in as `hei@bitmesra.ac.in`.
  2. Navigate to **HEI Matching** (`/app/hei-matching`).
  3. Inspect auto-matched academic capability dossiers for *BIT Mesra Innovation & Research Center*.
  4. Click **Commit Facilities & Faculty** for an open urban waste/water challenge.
  5. Confirm the institutional commitment state transitions to **`v1 ACCEPTED`** with optimistic concurrency locking (`expected_version: 1`).

---

### 4️⃣ Industry Partner (CleanWater Co)
- **Credentials**: `industry@cleanwater.co.in` / `Password123!`
- **Access / Workbench**: Industry Commitments & Resource Pledges
- **Testing Steps**:
  1. Open [`/login`](https://nirnay-sih-26043-one.vercel.app/login) and log in as `industry@cleanwater.co.in`.
  2. Browse open challenge passports at [`/challenges`](https://nirnay-sih-26043-one.vercel.app/challenges).
  3. Select a water/sanitation challenge and submit an **Industry Resource Pledge** (Equipment, sensors, or field technical support).
  4. Verify your commitment appears in the challenge's active partner roster.

---

### 5️⃣ Citizen Reporter
- **Credentials**: `citizen@ranchi.gov.in` / `Password123!`
- **Access / Workbench**: Public Challenge Intake & Citizen Submissions
- **Testing Steps**:
  1. Open [`/login`](https://nirnay-sih-26043-one.vercel.app/login) and log in as `citizen@ranchi.gov.in` (or use Mobile OTP with any mobile number + code `123456`).
  2. Navigate to the **Public Intake Portal** (`/app/report`).
  3. Fill out the issue report form: Title, District (*Ranchi*), Problem Category (*Solid Waste*), Description, and Evidence Files.
  4. Click **Submit Citizen Report** and verify issue tracking ID generation.

---

### 6️⃣ Platform Administrator
- **Credentials**: `admin@nirnay.gov.in` / `Password123!`
- **Access / Workbench**: System Administration & Organization Management
- **Testing Steps**:
  1. Open [`/login`](https://nirnay-sih-26043-one.vercel.app/login) and log in as `admin@nirnay.gov.in`.
  2. Access the **Central System Dashboard** (`/app`).
  3. View registered organizations (Government Departments, HEIs, MSMEs, Citizen Action Groups).
  4. Inspect platform-wide security audit logs and session activity telemetry.

---

## 🧪 3. Verification & Automated Test Status

All role permissions and state transitions are verified by automated tests:

```bash
cd apps/web
npm run test
```

- **Result**: `28/28 passed` (0 errors)
