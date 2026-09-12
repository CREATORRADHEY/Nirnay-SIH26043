# @nirnay/contracts

This package contains the canonical cross-language contracts for NIRNAY across the backend (Python) and frontend (TypeScript).

## Canonical Domain States

- **Machine-readable authority:** `domain-states.json` is the single source of truth for all workflow state sets.
- **Backend Representation:** `apps/api/app/core/enums.py`
- **Frontend Representation:** `apps/web/src/lib/contracts/domain-states.ts`

## Parity Verification

To verify that backend and frontend representations match the canonical contract without drift:

```bash
python3 scripts/check-contracts.py
```

Expected output: `NIRNAY contract parity: PASS`

## Modification Policy

Any changes to workflow state definitions, enums, or values require:
1. An explicit update to `docs/DECISION_REGISTER.md` and `docs/STATE_CONTRACT.md`.
2. Updating `domain-states.json`.
3. Updating backend and frontend contract files.
4. Running `python3 scripts/check-contracts.py` to confirm parity.
