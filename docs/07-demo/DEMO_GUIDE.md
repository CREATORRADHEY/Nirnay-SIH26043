# Demo Guide — NIRNAY

## 1. Hackathon Demonstration Sequence

This guide provides structured sequences for demonstrating NIRNAY during live evaluations.

---

## 2. 3-Minute Quick Demo Flow

```
0:00 - 0:30  | Problem & Product Thesis (Assignment ≠ Readiness | Completion ≠ Impact)
0:30 - 1:15  | Challenge Passport & Problem Qualification Gate (INNOVATION_CHALLENGE)
1:15 - 2:00  | Commitment Integrity & Scenario A Automated Readiness Invalidation
2:00 - 2:30  | Outcome Integrity & Scenario B (COMPLETED ≠ VALIDATED)
2:30 - 3:00  | AI Authority Boundaries & Summary
```

1. **Thesis (0:00 - 0:30)**: Open landing page (`http://localhost:3000`). Explain that NIRNAY prevents municipal resource waste by separating *Facts*, *Decisions*, *Readiness*, and *Outcomes*.
2. **Qualification Gate (0:30 - 1:15)**: Log in as `gov@nirnay.gov.in`. Open Review Queue (`/app/review`). Show a submitted civic problem. Execute qualification decision to `INNOVATION_CHALLENGE`. Open Challenge Passport (`/app/challenges/[id]`).
3. **Readiness Invalidation (1:15 - 2:00)**: Open Pilot Readiness Gate (`/app/readiness`). Show active `PILOT_READY` status. Withdraw HEI commitment. Demonstrate automatic status transition to `REVIEW_REQUIRED`.
4. **Outcome Integrity (2:00 - 2:30)**: Open Outcomes page (`/app/outcomes`). Show a pilot with `OperationalStatus = COMPLETED` and `EvidenceConclusion = INCONCLUSIVE`.
5. **AI Boundary (2:30 - 3:00)**: Open Guided Mode panel (`Guided Mode` header button). Show AI advisory boundaries: *AI Proposes → Human Authorizes*.

---

## 3. 5-Minute Deep-Dive Demo Flow

Extends the 3-minute sequence by adding:
- **Multilingual Support**: Toggle platform language to Hindi / Tamil / Telugu via `FloatingLanguageWidget`.
- **Decision Assurance Receipt**: Open `/app/evaluation` and inspect a signed decision receipt and second-reviewer sign-off.
- **Guided Mission Mode**: Trigger the 90-second Jury Architecture Tour overlay.
