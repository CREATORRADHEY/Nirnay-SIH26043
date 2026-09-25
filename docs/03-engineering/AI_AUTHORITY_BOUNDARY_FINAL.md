# AI Authority Boundary Specification — Final Contract

> **Project**: NIRNAY — Societal Innovation Collaboration & Readiness Platform (SIH26043)  
> **Phase**: P5.0 Final Product Cleanup & Foundation Audit  
> **Document ID**: `AI_AUTHORITY_BOUNDARY_FINAL.md`

---

## 1. Core Principle: Non-Authoritative AI Layer

In public-sector governance and evidence assessment, Artificial Intelligence (AI) operates strictly as an **Advisory Layer**. AI is non-authoritative: it cannot create authoritative domain decisions, mutate database readiness states, or allocate public resources.

All decision-making authority belongs exclusively to **authenticated human actors** (Government Nodal Officers, HEI Directors, MSME Partners) subject to PolicyService authorization gates.

---

## 2. Allowed AI Functions & Taxonomy

Every AI feature in NIRNAY is categorized into one of four allowed functional boundaries:

| Category | Allowed Purpose | AI Input | Schema Output | Human Authority Action |
| :--- | :--- | :--- | :--- | :--- |
| **STRUCTURE** | Format unstructured field reports into draft Challenge Passports | Citizen field report text & evidence files | Pydantic JSON Challenge Draft | Nodal Officer reviews and submits challenge intake |
| **SUMMARIZE** | Digest long evidence dossiers or technical proposals | Attached evidence files & clarification Q&As | Summary bullet points | Human reviewer inspects evidence summary |
| **SUGGEST** | Suggest candidate qualification routes & risk factors | Challenge Passport attributes | QualificationRoute recommendation + Risk analysis | Nodal Officer records authoritative Qualification Decision |
| **FIND PATTERNS**| Identify potential duplicate challenges & match HEI capacities | Challenge intake text & HEI capability directory | Candidate similarity scores & matched HEI IDs | Official selects & commits HEI candidates |

---

## 3. Explicit Prohibitions (AI System Boundaries)

The AI engine is strictly prohibited from executing any of the following actions:

1. ❌ **Approve Qualification**: Cannot set `qualification_route` or transition challenge to `QUALIFIED`.
2. ❌ **Mark Genuine**: Cannot certify field issue authenticity without human review.
3. ❌ **Create Commitment**: Cannot pledge institutional resources on behalf of an HEI or MSME.
4. ❌ **Create PILOT_READY**: Cannot approve pilot readiness decisions (`readiness_status`).
5. ❌ **Allocate Resources**: Cannot disburse funds or assign physical assets.
6. ❌ **Approve Funding**: Cannot grant public pilot budgets.
7. ❌ **Declare Impact**: Cannot mark evidence outcome as `VALIDATED` or `PROVEN`.
8. ❌ **Bypass PolicyService**: Cannot invoke mutations without user authentication and RBAC checks.
9. ❌ **Silent Mutation**: Cannot alter any database table behind the scenes.

---

## 4. Verification Pipeline & Enforcement

```text
[Raw User Input / Context] 
        │
        ▼
[Schema Constrained Inference] ──► (Pydantic Response Model + is_ai_advisory: true)
        │
        ▼
[Advisory Presentation UI] ──► Displays "AI ADVISORY ONLY" badge in workbench
        │
        ▼
[Human Reviewer Action] ──► Official clicks "Record Decision" (Authenticates Session + RBAC Gate)
        │
        ▼
[Authoritative DB Mutation] ──► Appends to Audit Log with Human Actor ID
```
