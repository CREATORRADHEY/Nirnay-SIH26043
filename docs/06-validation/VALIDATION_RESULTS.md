# Validation Results — NIRNAY

## 1. Verified Test Suite Summary

All test results documented below are verified from empirical execution runs against the canonical repository on current `main` (SHA: `0d4dd7179040c06497f5a9e33bfdf9b0cbe8ec4e`):

| Test Suite | Command | Executed | Passed | Failed | Status |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Backend Pytest** | `pytest app/tests` | 170 | 170 | 0 | **PASS** |
| **Frontend Unit Tests** | `npm test -- --run` | 31 | 31 | 0 | **PASS** |
| **TypeScript Typecheck** | `npm run typecheck` | N/A | N/A | 0 errors | **PASS** |
| **Next.js Production Build** | `npm run build` | 32 pages | 32 pages | 0 errors | **PASS** |

---

## 2. Backend Test Breakdown by Domain

```
Pytest Suite Breakdown (170 Total Passed):
  ├── TestAuthRBAC .................................... [12 tests passed]
  ├── TestChallengeAPI & Models ....................... [17 tests passed]
  ├── TestQualificationAPI & Decision Models ......... [11 tests passed]
  ├── TestHEIMatchingAPI & Capability Models ......... [16 tests passed]
  ├── TestCommitmentReadinessAPI & Integrity .......... [21 tests passed]
  ├── TestPilotOutcomeAPI & Models .................... [17 tests passed]
  ├── TestDecisionAssurance .......................... [ 7 tests passed]
  ├── TestJuryEvaluation & Scenarios .................. [ 5 tests passed]
  ├── TestAIAssistance & Boundaries .................. [12 tests passed]
  ├── TestSecurityClosure & IDOR ..................... [ 8 tests passed]
  └── TestDomainEnums & Config ....................... [44 tests passed]
```

---

## 3. Production Build Output

```
Route (app)
┌ ○ /
├ ○ /app
├ ○ /app/account
├ ○ /app/admin/ai
├ ○ /app/admin/audit
├ ○ /app/admin/organizations
├ ○ /app/admin/users
├ ○ /app/challenges
├ ƒ /app/challenges/[challengeId]
├ ○ /app/challenges/new
├ ○ /app/commitments
├ ○ /app/evaluation
├ ○ /app/hei-matching
├ ○ /app/notifications
├ ○ /app/outcomes
├ ○ /app/pilots
├ ○ /app/qualification
├ ○ /app/readiness
├ ○ /app/review
├ ƒ /app/review/[challengeId]
├ ○ /challenges
├ ƒ /challenges/[challengeId]
├ ○ /demo
├ ○ /login
└ ○ /register

(32 / 32 static and dynamic routes compiled without errors)
```
