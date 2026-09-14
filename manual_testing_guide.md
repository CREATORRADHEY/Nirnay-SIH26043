# 🧪 NIRNAY (SIH26043) — Manual Testing & Credentials Guide

> **Live Product**: [https://nirnay-sih-26043-one.vercel.app/](https://nirnay-sih-26043-one.vercel.app/)  
> **API Docs**: [https://nirnay-sih26043.onrender.com/docs](https://nirnay-sih26043.onrender.com/docs)  
> **GitHub Repository**: [https://github.com/CREATORRADHEY/Nirnay-SIH26043](https://github.com/CREATORRADHEY/Nirnay-SIH26043)

---

## 🔑 1. Quick Credentials & Demo Login File

You can log in to NIRNAY using **Email & Password** or **Mobile OTP**.

### 📧 Email & Password Credentials Table

| Role | Email Address | Password | Permissions & Primary Focus |
| :--- | :--- | :--- | :--- |
| **Government Nodal Officer** | `official@jharkhand.gov.in` | `Official@123` | Challenge qualification, pilot readiness approvals, governance sign-off. |
| **HEI Director / Institutional Lead** | `director@bitmesra.ac.in` | `Director@123` | HEI capability matching, committing labs & faculty resources (`ACCEPTED`). |
| **MSME / Startup Partner** | `partner@msme.gov.in` | `Partner@123` | Solution proposal submission, pilot co-execution. |
| **Community / Citizen Reporter** | `reporter@ranchi.gov.in` | `Reporter@123` | Field issue reporting, citizen evidence upload. |
| **Jury / Platform Admin** | `admin@nirnay.gov.in` | `Admin@123` | Full audit trail inspection, system oversight, role management. |

---

### 📱 Mobile OTP Instant Testing Access

1. Go to the Sign In page: [`/login`](https://nirnay-sih-26043-one.vercel.app/login)
2. Switch to the **Mobile OTP** tab.
3. Enter any 10-digit Indian Mobile Number (e.g. `9876543210`).
4. Click **Get OTP Code**.
5. Enter the instant testing code: **`123456`**.
6. Click **Verify & Sign In** to access the workbench immediately.

---

## 🔬 2. Manual Testing Workflows (Step-by-Step)

### Test Flow 1: Public Landing Page & Governance Copy
- **URL**: [https://nirnay-sih-26043-one.vercel.app/](https://nirnay-sih-26043-one.vercel.app/)
- **Steps**:
  1. Open the landing page.
  2. Verify ecosystem header: *"BUILT FOR A COLLABORATIVE INNOVATION ECOSYSTEM"*.
  3. Verify footer: *"NIRNAY — SIH26043 | Team CREATORZZZ - Production-oriented MVP for proposed public-sector deployment."*
  4. Ensure `/demo` links on header and footer point to `/challenges`.

---

### Test Flow 2: Challenge Explorer & Public Passports
- **URL**: [https://nirnay-sih-26043-one.vercel.app/challenges](https://nirnay-sih-26043-one.vercel.app/challenges)
- **Steps**:
  1. Filter challenges by District (*Ranchi*, *Hazaribagh*, *Dhanbad*) or Domain (*Urban Waste*, *Cold Chain Supply*, *Water Sanitation*).
  2. Click **View Passport** on any challenge card (e.g. *Ward 12 Solid Waste Processing*).
  3. Inspect baseline metrics, population estimates, and attached evidence dossiers.

---

### Test Flow 3: HEI Capability Matching & Commitment Binding
- **URL**: Log in as `director@bitmesra.ac.in` and navigate to `/app/hei-matching`
- **Steps**:
  1. Select an open challenge requiring academic/R&D capacity.
  2. Inspect auto-matched HEI capability dossiers.
  3. Click **Commit Facilities & Faculty** (State transitions to `v1 ACCEPTED`).
  4. Verify concurrency lock (`expected_version: 1`).

---

### Test Flow 4: Dependency Invalidation (Scenario A)
- **Objective**: Verify `PILOT_READY` automatically invalidates to `REVIEW_REQUIRED` when commitment drops.
- **Steps**:
  1. As Government Official (`official@jharkhand.gov.in`), mark challenge readiness as `PILOT_READY` (`version: 1`).
  2. As HEI Lead (`director@bitmesra.ac.in`), withdraw commitment (`version: 2 WITHDRAWN`).
  3. Re-open readiness status: System automatically reflects **`v2 REVIEW_REQUIRED`** with complete historical audit trail preserved.

---

### Test Flow 5: Operational Completion vs Evidence Outcome (Scenario B)
- **Objective**: Verify operational completion does NOT auto-generate impact claims.
- **URL**: [https://nirnay-sih-26043-one.vercel.app/pilots/b0a80002-0000-4000-8000-000000000006](https://nirnay-sih-26043-one.vercel.app/pilots/b0a80002-0000-4000-8000-000000000006)
- **Steps**:
  1. Advance pilot operational lifecycle to `COMPLETED`.
  2. Inspect outcome evaluation section: Status remains **`INCONCLUSIVE`** pending pre-declared baseline evaluation and human review sign-off.

---

## 🧪 3. Automated Test Suite Breakdown (28 Pass)

Run command:
```bash
cd apps/web
npm run test
```

### Test Case Execution Summary:

```tap
TAP version 13
ok 1 - DEMO_CHALLENGES contains factual dataset records
ok 2 - fetchChallenges fallback returns challenge list and isDemo flag
ok 3 - fetchChallenges respects district filter
ok 4 - fetchChallenges respects domain filter
ok 5 - fetchChallengeDetail retrieves valid challenge
ok 6 - fetchChallengeEvidence retrieves attached evidence
ok 7 - fetchQualificationHistory retrieves recorded decisions
ok 8 - fetchLatestQualification retrieves latest qualification decision
ok 9 - createQualificationDecision creates new decision version
ok 10 - fetchHEIOrganizations retrieves active HEI directory without match scores
ok 11 - createHEICandidate adds candidate with MANUAL method and rationale
ok 12 - fetchHEICandidates returns candidates list
ok 13 - fetchOrganizationCapabilities returns active capabilities
ok 14 - Commitment workflow: v1 ACCEPTED creation & expected_version validation
ok 15 - Commitment concurrency: stale expected_version throws 409 error
ok 16 - Readiness workflow: Condition assessment with commitment dependency
ok 17 - Readiness decision: REVIEW_REQUIRED cannot be manually created by client
ok 18 - Hero invalidation flow: ACCEPTED -> SATISFIED -> PILOT_READY -> WITHDRAWN -> automatic REVIEW_REQUIRED
ok 19 - Demo Fallback config: disabling NEXT_PUBLIC_ENABLE_DEMO_FALLBACK throws on network error
ok 20 - Pilot creation and authorization gate validation
ok 21 - Operational lifecycle advance: PLANNED -> ACTIVE -> COMPLETED
ok 22 - Evidence Plan creation with baseline & denominator definitions
ok 23 - Outcome assessment creation requires human reviewer and evidence plan reference
ok 24 - Hero Outcome Scenario: COMPLETED operational status + INCONCLUSIVE evidence conclusion
ok 25 - Golden Scenario A data parity: Ward 12 Waste Challenge
ok 26 - Golden Scenario B data parity: Hazaribagh Vendor Cold Chain Pilot
ok 27 - Production Auth & Security: Auth & Session state structure
ok 28 - Production RBAC: Multi-role permission matrix definitions
```

---

## 🔌 4. Core API Endpoints (Swagger / REST)

Interactive API Documentation: [https://nirnay-sih26043.onrender.com/docs](https://nirnay-sih26043.onrender.com/docs)

| HTTP Method | Endpoint Path | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Email/Password authentication & session cookie issue |
| `POST` | `/api/v1/auth/mobile-otp/send` | Send mobile OTP (Bypass: `123456`) |
| `GET` | `/api/v1/challenges` | Retrieve public challenge directory with filters |
| `GET` | `/api/v1/challenges/{id}` | Challenge Passport telemetry and evidence |
| `POST` | `/api/v1/commitments` | Create or update HEI commitment version |
| `POST` | `/api/v1/readiness` | Evaluate or update pilot readiness state |
| `PATCH` | `/api/v1/pilots/{id}/status` | Advance pilot operational status |
| `GET` | `/api/v1/audit-trail` | Immutable state audit logs for entity |
