# Release History — NIRNAY

## 1. Version History Summary

All release milestones documented below reflect verified git commit history and official repository tags.

```
Git Tag History:
  sih26043-final-v1.0 (Hackathon Initial Release Candidate)
  └── sih26043-final-v1.1 (Validated MVP Release - Current Head Tag)
```

---

## 2. Milestone Log

### Release `v1.1` (`sih26043-final-v1.1`)
- **Date**: September 26, 2026
- **Commit SHA**: `c6e1a06a68124b321299841f3ea1a675c0194866` (Merged into `main` at `0d4dd7179040c06497f5a9e33bfdf9b0cbe8ec4e`)
- **Key Enhancements**:
  - Integrated Guided Mission Mode (role-aware tours, Mission Navigator, `👁️ View Page` mode, 90-second Jury Tour).
  - Implemented client-side i18n support across 8 Indian languages with non-colliding `FloatingLanguageWidget`.
  - Added Decision Assurance Engine (`013_decision_assurance.py` migration) and Practical Jury Evaluation Workspace (`/app/evaluation`).
  - Hardened production configuration fail-safes (Argon2id session cookies, `DEMO_MODE` production checks, database URL sanitization).

### Release `v1.0` (`sih26043-final-v1.0`)
- **Date**: September 14, 2026
- **Commit SHA**: `be8f094`
- **Key Features**:
  - Initial end-to-end MVP release covering Challenge Passport, Qualification Gate, HEI Matching, Commitment Tracking, Pilot Execution, and Outcome Assessments.
