# NIRNAY — End-to-End Prompt Library FINAL v2.0

**Project:** NIRNAY — Societal Innovation Collaboration & Readiness Platform  
**Team:** CREATORZZZ • SIH26043  
**Tagline:** Right Problem. Ready Pilot. Proven Outcome.

## Final operating model

Ye library **scratch → working MVP → internal hackathon demo → staging → deployment-engineering baseline** ke liye hai.

### Context rule — important

**C00 ko har prompt ke saath repeat mat karo.** C00 ko ek new AI/coding session ki beginning mein paste/run karo. Uske baad same session mein sequential P-prompts use karo. Agar new chat/session open karte ho, **C00 + required P-prompt** do. Isse context bloat aur instruction drift dono kam hote hain.

### Production boundary

“Production readiness” = technical/deployment readiness baseline. Real Government of Jharkhand production launch tab tak claim nahi karna jab tak official identity/authority, privacy-retention policy, live data ownership, authorized integrations, responsible operating owner aur required approvals actually resolved na ho.

## Source authority — final

| Question | Controlling source |
|---|---|
| Mandatory platform/problem scope | Official SIH26043 Problem Statement |
| Product thesis / locked decisions | DOC00 v2.0 |
| Workflow, states, validation protocol | DOC01 |
| What is actually validated / not validated | TRL3 Report + B0 Workbook |
| Current implementation recommendation | DOC02; can change only with documented repo/test reason |
| Simple explanation | Team Explainer |

## Correct start path

- **Fresh repo:** C00 → P00 → P03 → P02 → P02A → P04 onward.
- **Existing repo:** C00 → P00 → P01 → P02 → P02A → P04 onward.
- **Do not** skip P02A if the TRL3 P2 source/kernel may exist.
- Acceptance Gate pass kiye bina next prompt par mat jao.

## Six execution gates

1. **G0 — Context Gate:** source authority + unresolved policies clear.
2. **G1 — Foundation Gate:** contracts/config/schema/seed/API stable.
3. **G2 — Vertical Slice Gate:** one golden case end-to-end works before dashboard polish.
4. **G3 — P2 Integrity Gate:** withdrawal/expiry/version/idempotency/resource conflict tests green.
5. **G4 — Demo Freeze:** golden E2E + reset + fallback + responsive/accessibility ready.
6. **G5 — Deployment Gate:** security/auth/storage/restore/observability complete; government production can still be NO-GO.

## Parallel team tracks

- **Tech Lead:** P00–P08A + integration + P56/P56A/P57/P58.
- **Frontend:** P16–P21 + P24/P26/P28/P29/P31/P34/P41/P42/P47/P47A.
- **Backend/Workflow:** P08–P15 + P22/P23/P23A/P25/P27/P30/P32/P33/P40.
- **AI/Data:** P35–P39; supports P22/P37/P38.
- **QA:** P43–P49 + negative authorization/security tests.
- **DevOps:** P50–P55A + P52A/P54A.

## Stop conditions

Agent ko stop/report karna hai if it would need to invent a government policy/API/identity, destroy history during migration, change P2 behavior without parity proof, expose evidence publicly, or claim success without runnable verification.

## Required completion format

Every implementation prompt ends with: **Changed files • What works • Commands/tests run + results • Acceptance gate status • Known limitations/blockers • Next dependency.**

# C00 — Master Context Block (Run Once Per New AI Session)

**Use:** New coding-agent/chat session ki beginning mein ye block paste karo. Same session mein repeat karne ki zarurat nahi.

```text
You are working on NIRNAY — Societal Innovation Collaboration & Readiness Platform for SIH26043, Team CREATORZZZ.

SOURCE AUTHORITY — use authority by question, not one blind linear order:
- Official SIH26043 Problem Statement = mandatory problem scope and required platform capabilities.
- DOC00 v2.0 = current product thesis, product boundaries and locked product decisions.
- DOC01 = workflow semantics, state logic, validation protocol and mechanism rules.
- TRL3 Technical Validation Report + B0 Workbook = evidence about what is and is NOT validated. Evidence beats implementation preference.
- DOC02 = implementation handbook/recommendation. It may be adapted when repository reality or verified test parity justifies it.
- Team Explainer = communication aid, not higher authority than the documents above.
If two sources conflict, explicitly report the conflict and follow the authority relevant to that question. Never silently invent a reconciliation.

LOCKED PRODUCT RULES:
- Core flow: Report → Verify → Qualify → Collaborate/Commit → Readiness → Pilot → Outcome.
- Qualification routes: SERVICE, CLARIFY, RESEARCH_REVIEW, INNOVATION_CHALLENGE. SERVICE + RESEARCH_REVIEW may coexist where appropriate.
- Commitment states: PROPOSED, OFFERED, ACCEPTED, DECLINED, WITHDRAWN, EXPIRED.
- Readiness condition states: SATISFIED, UNSATISFIED, UNKNOWN, DISPUTED, EXPIRED.
- Aggregate readiness: BLOCKED, REVIEW_READY, PILOT_READY, REVIEW_REQUIRED.
- PILOT_READY requires an authorized human sign-off. AI may never create PILOT_READY.
- Operational status and evidence conclusion are separate: operational = PLANNED/ACTIVE/COMPLETED/STOPPED; evidence conclusion = NOT_REVIEWED/VALIDATED/ITERATE/INCONCLUSIVE.
- P1 Qualification and P3 Evidence Plan remain simple, structured and deterministic where possible. Do not over-engineer them.
- P2 Commitment + dependency integrity is the hero custom mechanism. Preserve versioning, expected-version checks, idempotency, history, resource conflict protection and dependency invalidation.
- If a relied-on accepted commitment/resource/permission changes, is withdrawn, becomes disputed or expires, only affected readiness decisions move to REVIEW_REQUIRED. Unrelated cases remain unchanged.
- AI is assistive only: structure text, suggest routes, suggest related cases, shortlist HEIs/resources, flag missing data and summarize evidence. It must not invent authority, permission, capacity, funding, readiness or impact.
- Demo data must be explicitly labelled SYNTHETIC/DEMO. Do not invent government endorsement, live integration, real adoption, real impact or benchmark claims.
- UI principle: trust, clarity, accountability, evidence, status and next action. Never use a numeric readiness/genuineness score.
- Product line: “Assignment is not readiness. Completion is not impact.”

IMPLEMENTATION BASELINE:
- Fresh build: Next.js + React + TypeScript frontend; FastAPI + Pydantic backend; SQLAlchemy + Alembic; PostgreSQL; modular monolith.
- React Hook Form + Zod and TanStack Query or equivalent are acceptable frontend choices.
- pgvector is OPTIONAL and only allowed if it materially improves related-case/capability retrieval without blocking the golden flow.
- Evidence storage uses an adapter: local/private development storage first, S3-compatible private object storage for deployed environments.
- Testing: backend unit/integration tests + Playwright golden E2E.
- If the original TRL3 P2 SQLite/source package is present, DO NOT rewrite it merely for stack purity. First run characterization tests and preserve behavior. Either reuse it for the demo or port to PostgreSQL only after parity tests pass.
- “Production readiness” in this library means engineering/deployment readiness baseline. It does NOT mean authorized Government of Jharkhand production launch.

EXECUTION RULES:
1. Inspect the existing repository and relevant source documents before editing.
2. State the exact files/modules you intend to change before making changes.
3. Prefer the smallest production-clean implementation that satisfies the acceptance gate. Avoid broad rewrites.
4. Keep business rules in backend services/rules. Frontend can render/preview but is never the authority for readiness or permission.
5. Protect versioned writes with expected_version/optimistic concurrency where required.
6. Mutating retry-sensitive operations must be idempotent where required by the workflow.
7. Run relevant tests, typecheck, lint and migrations after changes. Never report success from inspection alone when execution is possible.
8. If tests fail, fix the root cause before declaring completion. Do not hide failures behind TODOs.
9. Do not mark the task complete if acceptance criteria are only mocked, hard-coded or bypassed unless the prompt explicitly asks for a demo mock.
10. If blocked by an unknown policy/authority/integration, implement a safe abstraction or mock, record the blocker and do not invent the missing real-world fact.
11. Do not expose secrets, raw stack traces, sensitive evidence, private object URLs or unnecessary PII.
12. At the end return exactly: Changed files • What works • Commands/tests run + results • Acceptance gate status • Known limitations/blockers • Next dependency.
```

# PHASE 0 — Context, Source Authority & Repo Reality

## P00 — Master Context Lock

**Goal:** Har new AI/coding session ko NIRNAY ke exact product boundaries dena.

**Owner:** Tech Lead / relevant role

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Read the available project sources using the SOURCE AUTHORITY rules above. Do not code yet.

Produce a concise implementation brief containing:
(a) mandatory PS capabilities,
(b) locked product thesis,
(c) non-negotiable state machines,
(d) actor/authority boundaries,
(e) hero P2 behavior,
(f) V1 non-goals,
(g) evidence limitations from TRL3,
(h) an UNRESOLVED POLICY REGISTER for anything not defined by the sources (identity authority, official SLA, retention, government integration, production owner, etc.).

Do not convert unresolved policy into guessed requirements. End with a “BUILD CONTEXT LOCKED” checklist.
```

**Acceptance Gate:** Scope, state machines, source authority and unresolved-policy register are explicit; no implementation or government-authority claim is invented.

## P01 — Repository Audit

**Goal:** Existing repo ho to pehle reality samjho.

**Owner:** Tech Lead / relevant role

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Audit the current repository before making any change. Inspect package manifests, folder structure, environment files, database/migrations, frontend routes/components, backend routers/services, tests, deployment config and README.

Return:
1. Current architecture map.
2. What already satisfies DOC02.
3. Gaps against the NIRNAY MVP.
4. Technical debt or conflicting status enums.
5. Broken or duplicate implementations.
6. A safe implementation order with P0/P1/P2 priorities.

Do not modify files in this task.
```

**Acceptance Gate:** We have a factual repo map and a prioritized gap list; no implementation assumptions remain.

## P03 — Monorepo Bootstrap

**Goal:** Scratch repo ko DOC02 structure me khada karna.

**Owner:** Tech Lead / relevant role

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

If the repository is empty, bootstrap this monorepo structure without adding product features yet:
- apps/web — Next.js TypeScript frontend
- apps/api — FastAPI backend
- packages/contracts — canonical enums/API types or generated schemas
- data/seed and data/fixtures
- scripts
- infra
- docs

If a working repo already exists, adapt minimally instead of restructuring for aesthetics. Add root README commands for install, dev, test and build.

Verify both applications start locally.
```

**Acceptance Gate:** Web and API start locally from documented commands; structure is understandable and no unnecessary microservice split exists.

## P02 — Version & Dependency Freeze

**Goal:** Team ke machines par reproducible stack lock karna.

**Owner:** Tech Lead / relevant role

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Propose and then implement a conservative version baseline for Node, Next.js, TypeScript, Python, FastAPI, SQLAlchemy, Alembic, PostgreSQL and test tooling that is compatible with the current repository. Prefer existing versions if healthy.

Create/update version files and dependency manifests only where needed. Add an `.env.example` without secrets. Document exact local prerequisites.

Run clean installs and report any incompatibility. Do not upgrade unrelated packages.

Also create/verify lockfiles, runtime version pins (`.nvmrc`/`.tool-versions` or equivalent, Python version file), and a single documented command sequence for a clean machine. Avoid floating dependency ranges for critical runtime packages in the final demo branch.
```

**Acceptance Gate:** Fresh clean install succeeds using committed lockfiles/runtime pins; versions are documented; no secret is committed.

## P02A — Persistence Strategy & TRL3 Kernel Reuse Gate

**Goal:** Fresh build aur existing TRL3 P2 kernel ke beech safe path choose karna.

**Owner:** Tech Lead + Backend/Workflow Lead

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Inspect the workspace specifically for the TRL3 P2 source/tests and its SQLite schema/fixtures.

Choose exactly one path and record it in an ADR:
A. TRL3 kernel absent → fresh PostgreSQL implementation using DOC02 + characterization expectations from TRL3.
B. Kernel present and demo deadline is near → keep the proven SQLite kernel behind repository/service interfaces for the internal demo; do not create a second conflicting source of truth.
C. Kernel present and PostgreSQL migration is justified → first run/freeze characterization tests, then port with differential tests proving state transitions, idempotency, stale-version rejection, resource conflicts and dependency invalidation remain equivalent.

Do not rewrite working P2 logic for architectural aesthetics. If choosing B, document the later migration boundary clearly.
```

**Acceptance Gate:** One persistence path is explicitly chosen; ADR exists; if a port occurs, behavioral parity tests pass before old kernel is retired.

# PHASE 1 — Foundation, Contracts & Data Model

## P04 — Canonical Contracts & Enums

**Goal:** Frontend/backend ke status mismatch ko day 1 par eliminate karna.

**Owner:** Tech Lead / relevant role

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Create one canonical contract source for all NIRNAY states and public DTO names. Include at minimum:
QualificationRoute, CommitmentState, ReadinessConditionState, ReadinessState, OperationalStatus, EvidenceConclusion, SourceType, OrganizationType, UserRole.

Use stable machine values such as `RESEARCH_REVIEW`, never display labels as database values. Add frontend display-label mapping separately.

Add contract tests or compile-time checks so frontend/backend cannot silently drift.

Choose and document one source-of-truth strategy for domain vocabulary. Do not maintain independent handwritten Python and TypeScript enum copies without a drift check. If code generation is not yet available, add a deterministic contract test that compares the public values.
```

**Acceptance Gate:** One canonical enum vocabulary exists; duplicate conflicting strings are removed; tests/typecheck pass.

## P05 — Configuration & Environment Layer

**Goal:** Dev/demo/staging/prod settings safe tarike se manage karna.

**Owner:** Tech Lead / relevant role

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Implement typed configuration for the API and frontend. Support at minimum: DATABASE_URL, DEMO_MODE, AI_PROVIDER, AI_API_KEY, EVIDENCE_STORAGE, storage credentials if used, CORS origins, JWT/session secret if applicable, log level and public API base URL.

Rules:
- Secrets never checked in.
- Demo-only actions must be disabled when DEMO_MODE=false.
- Validate required production variables at startup.
- Provide `.env.example` and README explanation.
```

**Acceptance Gate:** Application fails clearly on invalid production config; demo-only actions are gated; no hard-coded secret exists.

## P06 — PostgreSQL Core Schema

**Goal:** Challenge Passport ke linked records ka production-clean relational model banana.

**Owner:** Backend Lead

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Implement the PostgreSQL core schema with SQLAlchemy models and Alembic migrations for:
organizations, users, challenges, evidence_items, qualification_decisions, capability_profiles, commitments, readiness_conditions, readiness_decisions, projects, pilot_evidence_plans, observations, outcome_reviews, audit_events, notifications.

Use UUIDs or another consistent stable ID strategy. Include created_at/updated_at where meaningful. Preserve version/history semantics for decisions and commitments.

Do not store Challenge Passport as one giant JSON blob; it should be assembled from linked records. JSON fields are acceptable for bounded structured subfields such as reasons/evidence refs.

Add indexes for common list/filter lookups. Run migrations from an empty database.

For P2 integrity, add explicit relational support instead of relying only on JSON references:
- `decision_dependencies` (dependent decision, source entity type/id/version, dependency role, active flag/timestamps)
- `idempotency_records` (key, actor/scope, request hash, response/result reference, expiry as appropriate)
- `resource_reservations` if exclusive faculty/equipment/time allocation is enforced.
Use database constraints/indexes where they can prevent impossible states. Model time windows as timezone-aware and document half-open interval semantics `[start, end)` for conflict checks.
```

**Acceptance Gate:** Empty DB migrates successfully; schema supports all locked workflows plus explicit P2 dependency/idempotency/reservation integrity; operational/evidence status remain separate.

## P07 — Seed & Synthetic Data Foundation

**Goal:** Demo ko deterministic aur honest banana.

**Owner:** Tech Lead / relevant role

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Create deterministic synthetic seed data for NIRNAY. Primary golden case: irregular dry-waste pickup in a fictional/demo Jharkhand ward. Add 8–12 secondary fictional cases across streetlight, accessibility, transport scheduling, waste segregation, public-service delay, community facility access and similar non-sensitive domains.

Seed organizations/users for Citizen, Coordinator, Problem Owner, HEI/Faculty, Evaluator and State Admin. Mark demo data explicitly synthetic in the database or seed metadata.

Create `seed_demo` and `reset_demo` commands that are safe only in DEMO_MODE.
```

**Acceptance Gate:** Reset always produces the same golden starting state; UI/backend can identify synthetic records; no real-looking endorsement is implied.

# PHASE 2 — Backend Core & Access Control

## P08 — FastAPI Application Foundation

**Goal:** Backend ka clean modular-monolith skeleton banana.

**Owner:** Backend Lead

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Implement the FastAPI application foundation with modules for core/config/auth/errors, models, schemas, routers, services, repositories, rules, integrations and tests.

Add:
- `/health` and `/ready` endpoints
- request_id middleware
- structured error handling
- database session lifecycle
- API version prefix if appropriate
- OpenAPI metadata identifying this as NIRNAY Sample MVP / current environment

Do not add business rules to routers.
```

**Acceptance Gate:** API boots, health/readiness work, database session works, exceptions use consistent envelope, basic tests pass.

## P08A — OpenAPI → Frontend Contract Sync

**Goal:** Backend API aur frontend types ko generated contract se sync rakhna.

**Owner:** Backend Lead + Frontend Lead

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Once FastAPI foundation and first schemas exist, expose a stable OpenAPI document and generate or validate frontend TypeScript API types/client from it.

Requirements:
- generated artifacts live in a clearly marked generated folder/package;
- frontend code imports generated request/response types rather than manually duplicating DTO shapes;
- CI can detect stale generated contracts;
- domain display labels remain frontend-owned, machine values remain contract-owned;
- document the regeneration command.

Do not generate a huge SDK if a small typed client is sufficient.
```

**Acceptance Gate:** Changing a backend DTO causes a deterministic frontend contract diff/failure until regenerated; no silent shape drift remains.

## P09 — Error Envelope & Domain Errors

**Goal:** Frontend ko predictable failure states dena.

**Owner:** Backend Lead

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Implement a consistent error envelope and typed domain errors for at least:
VALIDATION_ERROR, NOT_FOUND, PERMISSION_DENIED, INVALID_TRANSITION, VERSION_CONFLICT, EXPIRED_DEPENDENCY, RESOURCE_CONFLICT, DUPLICATE_IDEMPOTENCY_KEY, EVIDENCE_REQUIRED, DEMO_ONLY_ACTION.

Map them to sensible HTTP status codes. Keep user-safe messages and optional structured details. Add tests for each mapping.
```

**Acceptance Gate:** Frontend can branch on stable error codes; no raw traceback/database error leaks to clients.

## P10 — Demo Auth + RBAC

**Goal:** Internal demo fast rakho, authorization fake na ho.

**Owner:** Backend Lead

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Implement V1 authentication/actor context appropriate for an internal hackathon. A demo role switcher may select seeded users, but backend authorization must use actor context and verify role/ownership.

Create permission checks for:
- citizen/report creation
- coordinator qualification decisions
- HEI commitment actions only for authorized HEI/faculty actor
- readiness sign-off only for allowed role
- outcome review only for evaluator role
- demo reset only when DEMO_MODE=true and allowed demo admin actor

Keep the architecture replaceable by OIDC/SSO later; do not claim government SSO exists.

Implement authorization as deny-by-default and keep authentication behind an interface/provider boundary. Demo role switching may create test actor context only when DEMO_MODE=true. Do not make frontend role selection a trusted credential. Add a machine-readable role/action matrix used by tests.
```

**Acceptance Gate:** Unauthorized API calls fail even if UI buttons are manipulated; demo role switch remains easy.

## P10A — Authorization Matrix + Negative Tests

**Goal:** Role-based access ko explicit aur testable banana.

**Owner:** Backend Lead + QA

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Create an authorization matrix for each protected action: create/read challenge, view sensitive evidence, approve qualification, create/accept/withdraw commitment, sign off readiness, edit evidence plan, create observation, record outcome, view dashboard, reset demo.

For every write action, define allowed roles/ownership conditions and at least one denied case. Implement tests that attempt forbidden cross-organization/cross-role access (IDOR/BOLA style). Deny by default when no rule exists.
```

**Acceptance Gate:** Every protected mutation has an allow rule, a deny test and ownership/jurisdiction handling where relevant; unknown roles/actions are denied.

## P11 — Audit Trail Foundation

**Goal:** Important decision history immutable-style preserve karna.

**Owner:** Backend Lead

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Implement audit event creation for important mutations: challenge submit/edit, qualification decision, commitment offer/accept/decline/withdraw/expire, readiness sign-off/reopen, evidence-plan update, observation add, outcome review, demo reset.

Each audit event should record actor, entity type/id, action, before/after snapshot or relevant delta, request_id and timestamp. Create events in the same transaction as the mutation where possible.

Expose a read API for entity activity timelines.
```

**Acceptance Gate:** Every P0 state mutation creates a readable audit event; failed transactions do not leave false audit entries.

## P12 — Challenge Intake APIs

**Goal:** Report creation se actual backend workflow start karna.

**Owner:** Backend Lead

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Implement challenge intake APIs and schemas. Required V1 fields should support problem title, raw description, source type, district/block/ULB or location text, domain/category if known, contact/assisted-submission metadata, structured AI draft fields and lifecycle status.

Allow raw Hindi/Hinglish/English text. Keep PII fields separable from public challenge summary.

Implement create, get, list/filter and safe edit-before-qualification operations. Add tests.
```

**Acceptance Gate:** Challenge can be created and retrieved; list filters work; PII is not accidentally exposed in public/safe DTO.

## P13 — Evidence Upload & Metadata

**Goal:** Photo/docs ko provenance ke saath attach karna, truth score nahi banana.

**Owner:** Backend Lead

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Implement evidence metadata and storage adapter. In local development store files safely under generated IDs; keep an interface for S3-compatible storage. Validate file size/type and never trust user filenames as paths.

Evidence metadata should support kind, storage reference, observed_at if provided, source, verification status, sensitivity and optional metadata.

Do not treat GPS/timestamp/hash as proof of truth; they are provenance signals only. Add upload/list/download-or-signed-access endpoints appropriate for V1.

Evidence upload security requirements: server-side MIME sniffing, extension allowlist, maximum size, generated object keys, path traversal protection, metadata sanitization, private-by-default storage and authorization on every read/download. Do not expose raw local filesystem paths or permanent public bucket URLs.
```

**Acceptance Gate:** Uploads are private/authorized, size/type validated server-side, metadata is stored safely, and unsafe paths/public URLs are not exposed.

## P13A — Secure Evidence Storage Adapter

**Goal:** Evidence files ko filesystem/public URL se decouple karke safely serve karna.

**Owner:** Backend Lead + DevOps

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Implement an EvidenceStorage interface with development and deployed adapters.

Development adapter may use local private storage.
Deployed adapter must support private S3-compatible object storage using generated object keys and short-lived authorized download/upload URLs or backend streaming.

Add a malware-scanning hook/interface (it may be a no-op in demo if no scanner is available, but the state must be explicit). Store upload status such as PENDING_SCAN / SAFE / REJECTED if implemented.

Define retention/deletion hooks without inventing the actual government retention period.
```

**Acceptance Gate:** No evidence object requires a permanent public URL; authorization is enforced; storage backend can change without rewriting business logic; scan/retention gaps are explicit.

## P14 — Problem Qualification Engine

**Goal:** Simple, explainable P1 gate implement karna.

**Owner:** Workflow / Backend

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Implement a deterministic Problem Qualification service based on structured questions/inputs rather than a black-box score. It must produce one or more routes from SERVICE, CLARIFY, RESEARCH_REVIEW, INNOVATION_CHALLENGE, with reasons, unknowns and evidence references.

Support SERVICE + RESEARCH_REVIEW in parallel. AI may draft a recommendation, but the persisted qualification decision requires an authorized human reviewer. Version qualification decisions rather than silently overwriting history.

Add tests for routine service issue, insufficient evidence, research uncertainty and innovation challenge cases.
```

**Acceptance Gate:** Routes are explainable and human-approved; no “genuineness %” or readiness score exists; version history is preserved.

## P15 — Challenge Passport Aggregate API

**Goal:** Ek case ki lifecycle ko one source of truth ke roop me assemble karna.

**Owner:** Backend Lead

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Create an aggregate `Challenge Passport` read service/API that returns a role-safe view of:
problem/original source, evidence, location/domain, current qualification, problem owner if known, capability suggestions, commitments, readiness, project/pilot, outcome, next actions and activity timeline.

Do not duplicate underlying data into a passport table just for convenience. Assemble from linked records. Apply field-level role safety for sensitive data.

Optimize obvious N+1 queries.
```

**Acceptance Gate:** Single endpoint/view can power the detail page and remains consistent with underlying records.

# PHASE 3 — Frontend Core

## P16 — Frontend Design System

**Goal:** GovTech UI ko consistent banana before screens proliferate.

**Owner:** Frontend Lead

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Create the NIRNAY frontend design foundation. Use restrained government-grade visual language: white/light neutral surfaces, navy/slate text, restrained blue, green for satisfied/accepted/ready/validated, amber for warning/unknown/review-required, red for blocker/expired/withdrawn, purple only where collaboration context helps.

Implement reusable components: Button, IconButton, Input, Textarea, Select/Combobox, StatusBadge, EvidenceCard, TimelineItem, MetricCard, Alert, Drawer, Modal, Table, Tabs, Stepper, EmptyState, Skeleton, Toast, ActivityLog, ConditionRow, CommitmentCard, DecisionCard, NextActionCard.

Accessibility: visible focus, keyboard support, 44px target where relevant, status not color-only. Add a component showcase/dev page if useful.
```

**Acceptance Gate:** Core components render consistently at desktop/mobile; no glassmorphism/neon/template clutter; accessibility basics pass.

## P17 — App Shell + Demo Role Switcher

**Goal:** Saare screens ke liye stable navigation frame banana.

**Owner:** Frontend Lead

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Build the NIRNAY app shell. Desktop: clear sidebar/top navigation. Mobile: responsive drawer/bottom-safe navigation. Top area must show current role/actor and a persistent “Demo / Synthetic Dataset” indicator when DEMO_MODE is active.

Implement demo user/role switching using the backend actor context mechanism; role switch should not bypass backend authorization. Include loading/error handling for session change.
```

**Acceptance Gate:** Navigation works at 1440/1280/768/390; synthetic banner visible; role switch changes backend actor context correctly.

## P18 — Report Challenge Screen

**Goal:** Citizen-facing intake ko trustworthy and simple banana.

**Owner:** Frontend Engineer

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Implement `/report` with fields from DOC02: problem title, description, location, district, block/ULB, category/domain, source type, contact/assisted submission, evidence upload and optional Hindi/Hinglish input.

Add “Structure this report” AI assist, clearly marked AI DRAFT. User must review/edit/confirm before submission. Show missing-field suggestions without blocking on AI.

Provide upload progress, validation, failure and retry states. On success show challenge ID and safe next step.
```

**Acceptance Gate:** A user can submit with AI unavailable; AI draft is never auto-submitted; form is usable at 390px and keyboard-accessible.

## P19 — Coordinator Inbox

**Goal:** Review queue ko operational banana, dashboard wallpaper nahi.

**Owner:** Frontend Lead

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Implement `/inbox` showing challenge ID, title, district/domain, source, evidence status, qualification status, current owner, next action and age.

Add filters: Needs Review, Needs Clarification, Service Route, Research Review, Innovation Challenge, Blocked, Pilot Ready, Review Required. Use URL/query state if practical.

Include loading, empty, error and synthetic-demo states. Rows/cards must open Challenge Passport.
```

**Acceptance Gate:** Filters return correct API results, next action is visible, mobile layout remains usable.

## P20 — Challenge Passport UI

**Goal:** Main detail page ko jury-grade lifecycle view banana.

**Owner:** Frontend Lead

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Implement `/challenges/[id]` as the main Challenge Passport UI. Desktop layout: main content plus sticky/compact lifecycle summary where appropriate. Tabs: Overview, Evidence, Qualification, Collaboration, Pilot, Activity.

Show original report separately from AI structured summary. Always expose evidence source/reference for important claims. Sidebar/summary should show current route, owner, lifecycle state and next actions.

Role-safe fields only. Do not make Passport itself the “innovation claim”.
```

**Acceptance Gate:** A coordinator can understand the case, current state and next action in under 30 seconds; all tabs handle missing data cleanly.

## P21 — Qualification UI

**Goal:** AI suggestion + human authority ko visually separate karna.

**Owner:** Frontend Lead

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Build the Qualification tab/page. Show structured qualification questions/answers, unknowns, evidence refs, AI suggestion if available, and a separate authorized human decision area.

Allow route selection including SERVICE + RESEARCH_REVIEW combination where valid. Button text should be explicit, e.g. “Approve Route”.

Show previous decision versions/history if present. Handle VERSION_CONFLICT gracefully by asking user to refresh/review.
```

**Acceptance Gate:** Human decision is visually distinct from AI draft; route can be approved; history and conflict state are understandable.

# PHASE 4 — Collaboration, Commitment & Hero P2

## P22 — Capability Profiles & HEI Shortlist

**Goal:** Match score ke badle explainable capability suggestion banana.

**Owner:** Workflow / AI Engineer

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Implement capability profiles for seeded HEIs/labs/partners and a shortlist service. Use domain/skills/facilities/availability metadata; optionally add semantic similarity only if already practical.

Return explainable reasons such as relevant discipline, prior capability tag, facility or availability note. Avoid fake precision like “96% match”. Surface unknown capacity honestly.

Provide API plus tests.
```

**Acceptance Gate:** Shortlist returns reasons and does not imply commitment; unavailable/highly relevant HEI can still decline.

## P23 — Commitment State Machine Backend

**Goal:** P2 ka core record implement karna.

**Owner:** Workflow / Backend

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Implement versioned commitments with states PROPOSED, OFFERED, ACCEPTED, DECLINED, WITHDRAWN, EXPIRED. Fields should support challenge, actor/resource, scope, effort if relevant, start/end, constraints, expiry and version lineage.

Rules:
- Material scope/date/resource change creates a new offered version requiring fresh acceptance.
- Accepted history is preserved.
- Accept/withdraw use `expected_version`.
- Mutating endpoints use idempotency keys.
- Unauthorized actor cannot accept/withdraw another organization’s commitment.
- Expiry is deterministic and testable.

Implement APIs and tests before UI.

For accepted commitments that reserve an exclusive resource/time slot, update commitment state and reservation atomically in one transaction. Conflict detection must use the documented half-open time interval rule and must be tested under concurrent/stale requests. Every material edit creates a new version; do not mutate the historical accepted version in place.
```

**Acceptance Gate:** All valid/invalid transitions are covered by tests; stale writes/idempotent replay behave correctly.

## P23A — Time-Based Expiry Reconciliation

**Goal:** Commitment/permission expiry ko real state behavior banana.

**Owner:** Workflow Engineer + Backend Lead

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Implement an idempotent expiry/reconciliation mechanism for time-based commitments and other expirable readiness inputs.

Choose the simplest reliable V1 strategy:
- periodic scheduler/cron calling a reconciliation command, and/or
- reconcile-on-read/startup safety net.

Rules:
- compare timezone-aware timestamps;
- repeated runs produce no duplicate mutations/events;
- an expired relied-on dependency triggers the same targeted REVIEW_REQUIRED logic as a withdrawal;
- unrelated and already-closed decisions are untouched;
- expose a CLI/admin-safe command for deterministic tests/demo.
```

**Acceptance Gate:** Advancing the clock/fixture past expiry deterministically marks the source expired and reopens only dependent readiness once, even if reconciliation runs repeatedly.

## P24 — Commitment UI

**Goal:** HEI ko explicit, scoped commitment dene ka interface banana.

**Owner:** Frontend Engineer

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Build Collaboration/Commitment UI. Coordinator sees explainable HEI suggestions and sends/records offer. HEI sees scope, dates, constraints and can ACCEPT, ACCEPT CONDITIONALLY via new offered details, DECLINE or later WITHDRAW with reason.

Show state badge, version, exact scope/dates/constraints, actor and history. Do not hide decline reasons.

On VERSION_CONFLICT, do not overwrite; refresh and show what changed.
```

**Acceptance Gate:** HEI actions update backend state and history; UI never reduces commitment to a match percentage.

## P25 — Readiness Engine Backend

**Goal:** Assignment se actual Pilot Ready ke beech hard gate banana.

**Owner:** Workflow / Backend

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Implement readiness conditions and aggregate readiness. Example required conditions for the golden scenario: accepted challenge scope, problem owner identified, accepted HEI commitment, field permission, baseline/evidence plan, privacy/safety review, feasible time window. Keep policy configurable enough for V1, but do not invent government policy.

Condition states: SATISFIED/UNSATISFIED/UNKNOWN/DISPUTED/EXPIRED.
Aggregate behavior:
- Missing/invalid required conditions => BLOCKED.
- All required checks complete but no authorized sign-off => REVIEW_READY.
- Authorized sign-off under the current dependency versions => PILOT_READY.
- Relied-on dependency later changes/expires => REVIEW_REQUIRED.

Persist relied_on_refs/version references in readiness decision. Add tests.

When a human creates a readiness decision, persist exactly which versioned commitments/permissions/evidence-plan records it relied on via `decision_dependencies`. The computed preview may change, but historical sign-off must remain reproducible from its recorded inputs.
```

**Acceptance Gate:** Backend cannot produce PILOT_READY without human sign-off and valid dependencies; aggregate states are deterministic.

## P26 — Pilot Readiness Workbench UI

**Goal:** NIRNAY ka hero screen jury ko immediately samjhana.

**Owner:** Frontend Lead

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Build the Pilot Readiness Workbench. Do NOT show a numeric readiness score. Show each condition with state, evidence/source, owner and next action. Header shows aggregate state and concise explanation.

For BLOCKED show “Why blocked”, “Owner”, “Next action”. For REVIEW_READY show pending authorized sign-off. For PILOT_READY show current authorization context. For REVIEW_REQUIRED show what changed and which previous decision depended on it.

Include appropriate confirmation before authorized sign-off.
```

**Acceptance Gate:** A non-technical reviewer can identify blocker and responsible next action without opening another screen.

## P27 — Dependency Invalidation Engine

**Goal:** PILOT READY ko stale dependency par automatically reopen karna.

**Owner:** Workflow / Backend

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Implement the P2 dependency invalidation workflow. A readiness decision stores exact relied-on references/versions. When a relied-on accepted commitment, permission or other critical dependency is withdrawn, expires or materially changes:
1. preserve the old record/history;
2. mark only affected current readiness decisions REVIEW_REQUIRED;
3. record the cause and changed dependency;
4. create/update next action;
5. create audit event;
6. leave unrelated/closed decisions unchanged.

Make the operation transaction-safe and idempotent. Add focused tests including unrelated control cases.

Implement invalidation from explicit `decision_dependencies`, not string search over JSON. The mutation to the source dependency and the creation/marking of REVIEW_REQUIRED + audit/next-action event must be transactionally consistent. Ensure closed/superseded decisions follow the frozen rule and unrelated active decisions are untouched.
```

**Acceptance Gate:** Withdrawal/expiry reliably reopens only affected readiness; duplicate events do not create duplicate side effects.

## P28 — Hero Withdrawal Interaction

**Goal:** Demo ka memorable moment polished banana.

**Owner:** Frontend + Workflow

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Implement the end-to-end hero interaction for the golden case:
- current commitment v3 = ACCEPTED
- current readiness = PILOT_READY
- HEI/Faculty performs WITHDRAW with reason “Faculty unavailable”
- backend creates v4 WITHDRAWN and invalidates the dependent readiness
- UI updates to REVIEW_REQUIRED
- show a prominent but professional alert explaining: what changed, affected decision, previous state, why it matters, and next action “Obtain replacement commitment”
- activity timeline preserves prior acceptance and readiness sign-off.

No manual page refresh should be required if normal query invalidation/refetch can handle it.
```

**Acceptance Gate:** Golden case performs Accepted → Withdrawn and Pilot Ready → Review Required correctly with preserved history.

## P29 — Idempotency / Conflict UX

**Goal:** Hard backend integrity ko usable UX me translate karna.

**Owner:** Frontend + Backend

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Add frontend handling for idempotent mutations and optimistic concurrency. Generate/reuse idempotency key per user action. Send expected_version on versioned writes.

For VERSION_CONFLICT show a clear message such as: “This commitment changed since you opened it. Refresh and review the latest version.” Never silently retry a semantically changed accept/withdraw.

For duplicate action caused by double-click/network retry, show the already-saved result rather than duplicate records.
```

**Acceptance Gate:** Double-click/network retry cannot duplicate commitment; stale UI cannot overwrite current version.

# PHASE 5 — Pilot Evidence & Outcome

## P30 — Pilot Project & Evidence Plan Backend

**Goal:** P3 ko structured template ke roop me implement karna.

**Owner:** Backend / Evaluator

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Implement Project and Pilot Evidence Plan services. Evidence Plan fields: outcome, baseline, metric, unit, denominator, target, collection method, time window, evidence owner, reviewer, adverse effects, stop rule, limitations and publication/permission metadata only if supported.

Add deterministic validation for missing baseline, missing/changed denominator, missing unit, invalid/too-short window where policy requires, missing sample size if relevant, photo-only evidence where insufficient, missing adverse-effect/stop-rule fields where required, and missing provenance refs.

Do not implement causal inference or fake “impact score”. Version plans and preserve history.

Version the Pilot Evidence Plan. If an approved plan is materially changed after PILOT_READY, decide from DOC01 rules whether the current readiness must be reviewed; do not silently replace the relied-on plan version.
```

**Acceptance Gate:** Plan can be created/updated/versioned; critical missing fields are explainably flagged; no unsupported causal conclusion is generated.

## P31 — Pilot Evidence Plan UI

**Goal:** Before pilot, measurable plan ko easy-to-review banana.

**Owner:** Frontend Engineer

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Build the Pilot Evidence Plan form/review UI. Use clear grouped sections: Outcome & Metric, Baseline, Target, Collection Method, Time Window, Ownership/Review, Adverse Effects & Stop Rule, Limitations.

Show deterministic validation feedback inline and a summary panel. AI helper may suggest missing information but must be marked suggestion.

Evaluator can approve/request changes according to V1 role rules; preserve versions.
```

**Acceptance Gate:** Golden plan can be completed and reviewed; missing denominator/baseline is obvious; mobile form is usable.

## P32 — Observations & Evidence Capture

**Goal:** Pilot data ko provenance ke saath store karna.

**Owner:** Backend + Frontend

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Implement project observations: metric, value, unit, denominator, observed_at/time window, evidence references and notes. Validate numeric/unit fields and require evidence refs for values that will be used in evaluation where applicable.

Create list/add APIs and UI table/cards. Do not automatically label improvement/success from raw values.
```

**Acceptance Gate:** Observations preserve metric/unit/denominator/provenance and can be reviewed without automatic success claim.

## P33 — Outcome Review Backend

**Goal:** Completion aur evidence conclusion ko intentionally separate karna.

**Owner:** Backend / Evaluator

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Implement Outcome Review. Project operational status remains PLANNED/ACTIVE/COMPLETED/STOPPED. Evidence conclusion is separately NOT_REVIEWED/VALIDATED/ITERATE/INCONCLUSIVE.

Evaluation should compare the approved plan and observations for structural comparability only; do not perform causal inference. If denominator/unit/time window is not comparable or critical evidence is missing, recommend/allow INCONCLUSIVE with reason. Authorized evaluator records final evidence conclusion and limitations.

Add tests proving STOPPED + INCONCLUSIVE is valid.

Do not perform causal inference automatically. A numerical change is not automatically “impact”. Preserve denominator, unit, baseline window, comparison window and evidence provenance; if comparability is broken, INCONCLUSIVE must remain available even when operational status is COMPLETED or STOPPED.
```

**Acceptance Gate:** No code conflates STOPPED with evidence conclusion; insufficient comparability cannot become VALIDATED by default.

## P34 — Outcome Review UI

**Goal:** “Completion is not impact” ko product behavior banana.

**Owner:** Frontend Lead

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Build the Outcome Review UI. Display operational status in one section and evidence conclusion in another. Show approved baseline/target beside observed values with unit, denominator and evidence refs.

Golden demo: baseline 27 missed pickups/week over 10 wards; after value 14 but denominator is 5 wards. Surface “Comparison denominator changed” and show evidence conclusion INCONCLUSIVE, not SUCCESS/48% improvement.

Allow evaluator reason/limitations and preserve review history.
```

**Acceptance Gate:** The denominator mismatch demo clearly ends INCONCLUSIVE while project may still be COMPLETED or STOPPED.

# PHASE 6 — AI Assistance

## P35 — AI Adapter Layer

**Goal:** Provider lock-in aur demo failure risk kam karna.

**Owner:** AI Engineer

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Implement an AIAdapter interface with at least LiveLLMAdapter and DemoMockAdapter. Methods: structure_report, suggest_qualification, shortlist_capabilities, review_evidence_plan, optionally summarize_outcome.

All AI outputs must be validated against strict Pydantic/JSON schemas. Unsupported fact => null/UNKNOWN. Log use case/model/latency safely when live. Never log secrets.

If AI_PROVIDER=mock, return deterministic demo outputs.

Add timeouts, bounded retries for transient failures, schema validation, model/provider metadata and a deterministic fallback path. Never retry a non-idempotent side effect through the AI adapter because AI calls must not own state transitions.
```

**Acceptance Gate:** Application works end-to-end with AI disabled/mock; invalid model JSON never corrupts domain state.

## P36 — AI Report Structuring

**Goal:** Hinglish raw report se useful draft banana.

**Owner:** AI Engineer

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Implement `structure_report` for raw Hindi/Hinglish/English text. Output only structured draft fields such as concise issue summary, domain, location text if explicitly present, duration if stated, affected context if stated, and missing-information list.

Prompt rules: do not infer precise location, identity, severity, cause or genuineness. Cite/source each extracted field back to raw text span if practical.

Use the golden example “hamare ward me garbage gadi...” and tests for missing information.
```

**Acceptance Gate:** AI extraction is schema-valid, grounded, editable and does not invent facts.

## P37 — AI Qualification Suggestion

**Goal:** Human route decision ko assist karna, replace nahi.

**Owner:** AI Engineer

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Implement a qualification suggestion prompt/service that receives reviewed challenge fields, evidence metadata and deterministic question states. Return suggested route set, reasons, unknowns and evidence refs.

System prompt must explicitly prohibit autonomous approval/rejection and prohibit invented owner/permission/capacity/funding. Store suggestion separately from human qualification decision.

Add fallback when model unavailable.
```

**Acceptance Gate:** Suggestion is visibly non-authoritative and cannot mutate qualification decision.

## P38 — AI/Hybrid HEI Shortlist

**Goal:** Explainable shortlist without fake precision.

**Owner:** AI / Data Engineer

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Implement capability shortlist logic using structured profile overlap first. If embeddings are already available, use them only as a candidate signal, not the final truth. Return 3–5 candidates with human-readable reasons and known capacity/availability note.

Never output fabricated faculty expertise or live capacity. If capacity is unknown, state UNKNOWN. No percentages unless they are purely internal and not shown to users.
```

**Acceptance Gate:** Shortlist can include a relevant HEI that later declines; reasons are traceable to seeded capability data.

## P39 — AI Safety / Failure Handling

**Goal:** LLM outage aur prompt injection se product workflow safe rakhna.

**Owner:** AI + Backend

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Harden AI calls:
- timeouts/retries with bounded attempts
- mock/manual fallback
- schema validation
- attachment text treated as untrusted data, never instructions
- no secrets or PII beyond what the use case strictly requires
- user-facing “AI unavailable — continue manually” state
- do not block core qualification/readiness on LLM availability

Add tests/mocks for malformed JSON, timeout and malicious attachment text.

Treat uploaded/document text as untrusted data, not instructions. Add prompt-injection resistance by delimiting evidence, refusing tool/action instructions from evidence text, minimizing PII sent to models, and logging only safe metadata. Rate-limit public AI-assisted endpoints.
```

**Acceptance Gate:** Core workflow continues without AI; malformed/malicious model input/output cannot change authority states.

# PHASE 7 — Dashboard & Demo Reliability

## P40 — Dashboard Aggregation API

**Goal:** Useful operational metrics backend se derive karna.

**Owner:** Backend Lead

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Implement dashboard summary queries for synthetic/demo dataset: reports, qualified challenges, service-routed, research review, innovation challenges, accepted commitments, blocked, review-ready, pilot-ready, review-required and outcome breakdown. Add top blockers and next-action queue.

Compute from actual seeded/workflow records; do not hard-code counts in frontend. Clearly flag demo/synthetic context in response meta if useful.
```

**Acceptance Gate:** Counts change correctly after workflow mutations and match underlying records.

## P41 — Government Dashboard UI

**Goal:** Data wallpaper nahi, decision dashboard banana.

**Owner:** Frontend Engineer

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Build `/dashboard` with only useful cards and queues from DOC02. Include metric cards, outcome breakdown, top blockers and next-action queue. Each actionable item should click through to the case.

Avoid vanity charts. Persist “Demo / Synthetic Dataset” label. Do not show rupee savings, statewide adoption, fake citizen counts or accuracy claims.
```

**Acceptance Gate:** Dashboard is readable in under one screen on laptop and updates after golden workflow state changes.

## P42 — Demo Reset & Presenter Controls

**Goal:** Internal hackathon demo ko deterministic banana.

**Owner:** QA / DevOps

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Implement a DEMO_MODE-only control surface with Reset Demo and, if useful, Next Demo Step. Reset must safely restore the golden scenario without touching non-demo data. Step actions should call real APIs/state transitions, not fake UI-only state.

Expose a clear confirmation before reset. Add a script/endpoint test for deterministic result.
```

**Acceptance Gate:** Presenter can reset to known starting point in under 10 seconds; controls are impossible when DEMO_MODE=false.

# PHASE 8 — Testing, Accessibility, Security & Performance

## P43 — Backend Unit Test Pack

**Goal:** Locked state machines ko regression-safe banana.

**Owner:** QA + Backend

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Write/complete backend unit tests for:
- qualification route rules and parallel route
- commitment transitions
- expected_version conflict
- idempotency replay
- exclusive resource conflicts if implemented
- readiness aggregation
- human sign-off gate
- dependency invalidation only affected decisions
- operational/evidence status separation
- evidence-plan validation.

Use deterministic fixtures and clear test names. Do not merely snapshot implementation details.
```

**Acceptance Gate:** P0 business-rule test suite passes and fails meaningfully if a locked rule is broken.

## P44 — API Integration Test Pack

**Goal:** Database + auth + service boundaries together test karna.

**Owner:** QA Engineer

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Add API integration tests covering create report → qualification → offer → accept → readiness → sign-off → withdraw → review required → evidence plan → observations → outcome review. Also test permission denial, stale version, duplicate idempotency, missing evidence and demo reset gating.

Run against an isolated test database/migration lifecycle.
```

**Acceptance Gate:** Core end-to-end API path passes against real test DB; unauthorized and conflict paths are covered.

## P45 — P2 Adversarial Integrity Tests

**Goal:** Hero mechanism ko edge cases par todne ki koshish karna.

**Owner:** QA + Workflow

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Red-team the P2 engine. Create adversarial tests for duplicate requests, out-of-order events, stale accept after withdrawal, expiry at boundary time, adjacent vs overlapping resource windows, unrelated dependency mutation, already-closed project, repeated invalidation, transaction failure mid-workflow and replay after process restart if practical.

Do not weaken a test just to make implementation pass. Fix root cause.
```

**Acceptance Gate:** No double booking/unauthorized transition/history corruption; only affected decisions reopen; replay remains consistent.

## P46 — Playwright Golden E2E

**Goal:** Browser level par full jury demo protect karna.

**Owner:** QA Engineer

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Write a Playwright E2E test for the golden flow:
Report → AI/manual structure → qualification → HEI A decline → HEI B accept → readiness blocked → satisfy blockers → review ready → authorized sign-off → pilot ready → faculty withdrawal → review required → replacement commitment → readiness restored → pilot complete → denominator mismatch → INCONCLUSIVE → dashboard reflects update.

Prefer stable data-testid selectors. Use demo reset in test setup.
```

**Acceptance Gate:** Golden E2E passes reliably from a clean seeded state and captures failure screenshot/trace on error.

## P47 — Responsive + Accessibility QA

**Goal:** Award-level UI ko actual devices/keyboard par verify karna.

**Owner:** Frontend + QA

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Perform a visual/accessibility QA pass at 1440, 1280, 768 and 390 widths. Check overflow, table/card adaptation, sticky panels, modal placement, long labels/IDs, touch targets, focus order, keyboard navigation, color contrast, status text/icon redundancy, form errors and loading/empty/error states.

Fix issues directly. Do not change business rules during visual QA. Return before/after screenshots or a concise issue log if tooling allows.

Add automated accessibility checks (for example axe in Playwright) for the golden screens where feasible. Test keyboard-only navigation, focus restoration after dialogs, status semantics without color, 200% zoom/reflow and reduced motion. Do not claim WCAG compliance from a single automated scan.
```

**Acceptance Gate:** No horizontal page overflow at 390; primary flows keyboard usable; no clipped status/actions; major contrast/focus issues fixed.

## P47A — Language, Low-Bandwidth & Resilience Pass

**Goal:** Jharkhand-facing citizen flow ko practical banana without fake offline claims.

**Owner:** Frontend Lead + QA

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Harden the citizen-facing flow for multilingual/low-bandwidth use.

Requirements:
- UI copy structure must support English/Hindi localization; Hinglish/free-form input is accepted even if full translation coverage is not complete.
- avoid hard-coding strings deep inside business components where practical;
- preserve an in-progress report draft locally before submission;
- compress/resize images client-side only when quality/provenance is not materially harmed and preserve original metadata policy as defined;
- show upload progress/retry and recover from transient network failure;
- lazy-load non-critical dashboard assets;
- test at throttled network conditions.

Do not claim offline submission unless a real queued/offline workflow is implemented.
```

**Acceptance Gate:** Citizen draft survives a refresh/interruption, upload failure is recoverable, core submission works on throttled network, and language architecture does not require a rewrite later.

## P48 — Security & Privacy Pass

**Goal:** Demo se production path me obvious security debt remove karna.

**Owner:** Security / Backend / QA

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Audit and fix V1 security/privacy issues: backend RBAC, IDOR/object access, input validation, upload path/type/size, secret handling, CORS, rate limiting for public/AI endpoints if exposed, PII separation, error leakage, unsafe HTML/markdown rendering, SQL injection via ORM/raw queries, demo actions in production, AI prompt injection boundary and audit integrity.

Do not add heavy enterprise infrastructure unless needed. Produce a short threat table: risk, current mitigation, deferred control.

Perform a lightweight threat model covering at minimum: IDOR/BOLA on case/evidence IDs, broken role authorization, upload abuse, XSS, CSRF where cookie auth is used, CORS misconfiguration, SSRF if URLs are ever fetched, leaked object URLs, SQL injection, prompt injection, rate-limit abuse, secrets exposure and demo-mode leakage. Run dependency vulnerability and secret scans supported by the repo. Record unresolved risks rather than hiding them.
```

**Acceptance Gate:** No critical/high obvious vulnerability remains in P0 flows; deferred risks are explicitly documented.

## P48A — Threat Model + Supply-Chain Security

**Goal:** Production baseline se pehle obvious security gaps ko systematically identify karna.

**Owner:** QA/DevOps + Backend Lead

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Create a concise STRIDE-style threat model for NIRNAY data flows: browser, API, database, object storage, AI provider and admin/demo controls.

Then run practical checks available to the stack:
- dependency vulnerability scan (npm/pnpm + Python tooling);
- secret scan;
- static lint/security checks where useful;
- verify lockfiles;
- review third-party package necessity/licenses for critical runtime dependencies;
- list attack surface and mitigations.

Do not automatically upgrade major versions during this task. Open separate fixes for vulnerabilities that require risky upgrades.
```

**Acceptance Gate:** Threat model and scan outputs exist; critical/high findings are fixed or explicitly block release; no secret is present in repository history/current tree to the extent tooling can verify.

## P49 — Performance & Query Pass

**Goal:** Demo smooth ho aur obvious N+1 na ho.

**Owner:** Tech Lead

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Profile the main endpoints/pages: inbox, challenge passport, readiness, dashboard. Identify N+1 queries, oversized payloads, repeated AI calls, missing indexes and expensive rerenders.

Apply only evidence-based optimizations: query eager loading, pagination, sensible indexes, frontend query caching/invalidation, image/file lazy loading. Do not prematurely introduce Redis/microservices.

Measure before optimizing. Capture representative query count/latency for inbox, passport, readiness and dashboard using the synthetic dataset; inspect slow SQL with EXPLAIN where useful. Set a documented demo/staging budget from observed measurements, not invented benchmarks, then verify regression after indexes/caching.
```

**Acceptance Gate:** Main seeded pages feel responsive; obvious N+1/repeated calls removed; no architecture inflation.

# PHASE 9 — DevOps, Staging & Deployment Engineering

## P50 — Docker / Local Reproducibility

**Goal:** New teammate ko one documented setup path dena.

**Owner:** DevOps

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Create/clean local development orchestration using Docker Compose for PostgreSQL and optional supporting services only. Keep frontend/backend dev commands simple. Add health checks and volumes appropriate for development.

Document first-run commands: install, env copy, DB start, migrations, seed, API start, web start, tests. Verify from a clean environment as far as tooling permits.

Use non-root containers where practical, healthchecks, reproducible builds and a `.dockerignore`. Database migrations must run as an explicit deploy step, not every web request/startup race.
```

**Acceptance Gate:** A teammate can follow README from clean checkout without tribal knowledge.

## P51 — CI Pipeline

**Goal:** Broken main/demo branch prevent karna.

**Owner:** DevOps

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Add CI for pull requests/main that runs: frontend install/typecheck/lint/build, backend dependency install/tests, migration sanity check, and a lightweight integration test. Add Playwright smoke/golden flow on appropriate branch if runtime allows.

Cache dependencies safely. Never expose secrets. Fail fast on schema/test failure.

CI should include secret scanning and dependency vulnerability checks where available, plus a migration-from-empty check. Fail the build if generated API contracts are stale.
```

**Acceptance Gate:** PR cannot pass with failing P0 tests/typecheck/build; CI config is documented.

## P52 — Staging / Demo Deployment

**Goal:** Internal hackathon ke liye stable deployed environment banana.

**Owner:** DevOps

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Deploy a staging/demo environment using the simplest reliable stack available to the team: hosted Next.js frontend, hosted FastAPI service and managed PostgreSQL. Configure environment variables, CORS, HTTPS, database migrations and synthetic seed/reset.

Do not claim this is government production. Show a visible Demo/Synthetic label. Verify all golden flow APIs from the deployed frontend.

Return deployment architecture, environment URLs/placeholders, and rollback notes without exposing secrets.

Staging must use HTTPS, private evidence storage, environment-specific CORS, synthetic data and DEMO_MODE=true only if presenter controls are required. Never connect staging to real citizen/government data for this hackathon.
```

**Acceptance Gate:** Golden E2E works on deployed demo over HTTPS; no localhost dependency; demo reset works.

## P52A — Production Authentication Adapter Gate

**Goal:** Demo role switch ko real deployment authentication se safely separate karna.

**Owner:** Backend Lead + DevOps

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Implement an authentication provider interface with at least:
- DemoAuthProvider (enabled only in DEMO_MODE);
- OIDC-compatible production adapter/configuration boundary (generic standards-based, not branded as a government integration unless actually authorized).

Map trusted identity claims to internal user/organization/role only through server-side configuration. Production-like environments must refuse to start or refuse protected routes if only DemoAuthProvider is configured.

Do not invent Jharkhand SSO endpoints, client IDs or identity policy.
```

**Acceptance Gate:** Demo auth cannot accidentally be used as production auth; real OIDC integration can be configured later without changing business authorization logic; unresolved official identity policy remains documented.

## P53 — Observability & Runtime Diagnostics

**Goal:** Demo fail ho to 2 minute me cause pata chale.

**Owner:** DevOps + Backend

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Add pragmatic observability: structured API logs with request_id, error logging, deployment health/readiness, key mutation/audit trace, and optional error monitoring if already available. AI calls log use case/model/latency only when safe.

Create a “demo incident checklist” for API down, DB unavailable, AI unavailable and file upload failure. Core manual flow must remain usable when AI is down.

Do not log raw evidence content, auth tokens or sensitive citizen fields. Add correlation/request IDs across frontend-visible errors and backend logs. If using an error-monitoring service, scrub PII before transmission.
```

**Acceptance Gate:** Team can diagnose common demo failures quickly; AI outage has a graceful fallback.

## P54 — Backup, Migration & Rollback Plan

**Goal:** Production path me data safety ka minimum runbook banana.

**Owner:** DevOps

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Prepare a practical database migration/rollback and backup plan for staging and future production.

Include:
- Alembic migration discipline
- backup before risky migration
- restore test procedure
- backwards-compatible deployment preference
- how to roll back app vs database
- demo reset separated from backups

Do not pretend a backup is tested unless you actually test restore in an isolated environment.

A backup document alone is insufficient. Execute at least one restore drill into a separate temporary database/environment, run migrations if required, then run health + a golden-flow smoke check. Record restore duration and any manual steps.
```

**Acceptance Gate:** Runbook exists; at least staging restore procedure is tested or clearly marked pending.

## P54A — Backup Restore Drill

**Goal:** Backup ko actual recoverability proof mein convert karna.

**Owner:** DevOps + Backend Lead

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Execute the backup/restore procedure, not just document it.

1. Seed a known synthetic state.
2. Create a database backup and identify evidence-storage backup assumptions.
3. Restore into a clean temporary database/environment.
4. Run migrations if the documented procedure requires them.
5. Verify row counts/checkpoints plus health and one golden-flow smoke path.
6. Record RTO-like observed duration only as a test observation, not a production SLA.
7. Destroy the temporary restored environment safely.

If the hosting platform prevents a real restore, mark the gate failed and document the exact missing capability.
```

**Acceptance Gate:** A restore has been executed and verified on a clean target, or production readiness is explicitly blocked with the reason.

## P55 — Production Configuration Hardening

**Goal:** Demo flags hata kar real deployment-safe defaults banana.

**Owner:** DevOps + Backend

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Prepare production configuration mode without claiming authorization to launch. Requirements:
- DEMO_MODE=false by default in production
- demo role switch/reset inaccessible
- strict CORS origin allowlist
- strong secret/session config
- HTTPS assumptions documented
- upload limits and storage config
- public endpoint rate limits if applicable
- structured logs without sensitive payloads
- startup config validation
- database pool/timeouts appropriate for the chosen host

Keep government SSO/integration as an adapter/TODO unless actually authorized.

Production configuration must fail closed if DEMO_MODE or mock authentication is enabled unintentionally. Apply secure headers/CSP where compatible, strict CORS, secure cookies if used, private object storage, minimum database privileges, secret rotation procedure and separate credentials per environment.
```

**Acceptance Gate:** Production-mode config blocks demo shortcuts and starts only with valid secure configuration.

## P55A — Data Classification, PII & Retention Controls

**Goal:** Citizen/evidence data ke privacy boundaries ko code/config mein enforceable banana.

**Owner:** Backend Lead + Product/Policy Owner

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Create a data-classification map for NIRNAY fields: public case summary, internal operational data, PII/contact, sensitive evidence, audit/security metadata.

Implement:
- response schemas that exclude PII by default;
- role-gated endpoints/fields for sensitive evidence/contact;
- log redaction;
- configurable retention/deletion hooks without inventing retention duration;
- export/delete workflow placeholders only where policy is unresolved, clearly marked NOT AUTHORIZED/NOT CONFIGURED rather than fake-complete;
- documented data-flow to AI providers with minimization.

Do not put sensitive fields into dashboard aggregates or client-side seed bundles.
```

**Acceptance Gate:** PII/sensitive fields are classified and least-privilege by default; logs/AI payloads are minimized; unresolved retention policy cannot be mistaken for an implemented policy.

## P56 — Production Readiness Audit

**Goal:** “Can we deploy?” ko checklist-based decision banana.

**Owner:** Tech Lead + QA

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Conduct a final production-readiness audit of the repository and deployed staging. Do not make marketing claims. Evaluate:
functional completeness, state-machine integrity, auth/RBAC, security/privacy, migrations/backups, logging, availability fallbacks, accessibility, browser/mobile compatibility, data labelling, AI failure handling, documentation, test coverage, deployment rollback and known policy/integration gaps.

Return a table with PASS / BLOCKER / DEFERRED and evidence (file/test/URL where possible). Categorize blockers as P0/P1/P2. Do not mark production-ready if external policy/authorization is missing.

Separate “TECHNICALLY DEPLOYABLE” from “AUTHORIZED FOR GOVERNMENT PRODUCTION”. The audit must output both decisions independently. Government production must be NO-GO if identity/authority, privacy/retention policy, live data ownership, official integrations or responsible operational owner are unresolved.
```

**Acceptance Gate:** There is an evidence-backed go/no-go list; no known P0 technical blocker is hidden.

## P56A — Final Go / No-Go Matrix

**Goal:** Internal demo, technical staging aur real government production ko clearly separate karna.

**Owner:** Tech Lead + Product Owner

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Create a final three-column release decision:
1. INTERNAL HACKATHON DEMO
2. TECHNICAL STAGING / CONTROLLED PILOT ENVIRONMENT
3. AUTHORIZED GOVERNMENT PRODUCTION

For each, mark GO / CONDITIONAL GO / NO-GO and evidence for:
- golden flow
- P2 integrity
- auth/authorization
- privacy/retention
- evidence storage
- backup/restore
- monitoring
- real owner/authority
- official identity/integrations
- real data approval
- independent validation

A technically strong build may be GO for demo/staging and still NO-GO for government production. Preserve that distinction.
```

**Acceptance Gate:** Release decision cannot collapse demo readiness into government production readiness; every NO-GO has an owner/evidence-needed next step.

## P57 — Release Runbook

**Goal:** Final demo/release ko repeatable steps me freeze karna.

**Owner:** DevOps / Demo Owner

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Create a release runbook for NIRNAY. Include branch/tag naming, CI green check, migrations, seed/demo state, environment variables, deploy order, smoke tests, golden E2E, rollback trigger, rollback steps, release notes and owner for each action.

For internal hackathon add a “T-30 min demo checklist”: reset golden case, verify roles, verify withdrawal interaction, verify outcome INCONCLUSIVE, verify AI fallback, keep screenshots/video backup.
```

**Acceptance Gate:** Another teammate can execute the release/demo checklist without asking the author for missing steps.

## P58 — Final Documentation Pack

**Goal:** Code ke saath handover documentation complete karna.

**Owner:** Tech Lead

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Update repository documentation to reflect the code that actually exists. Required:
- README setup/run/test/deploy/demo flow
- architecture summary
- role matrix
- API/OpenAPI link or generated reference
- database/state machine summary
- AI boundary and fallback
- synthetic data notice
- known limitations
- security/deployment notes
- contribution/branching guidance

Do not copy future features into “implemented” sections.
```

**Acceptance Gate:** Docs match current repo and a new developer can locate every major subsystem.

# PHASE 10 — Jury Demo & Post-MVP Validation

## P59 — 5-Minute Jury Demo Rehearsal

**Goal:** Technical build ko winning narrative me test karna.

**Owner:** Demo Owner / Team Lead

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Using the actual deployed NIRNAY build, create and rehearse a 5-minute live demo path. The demo must prove product behavior, not just navigate screens:
1. citizen report and AI draft
2. human qualification
3. HEI decline then accepted commitment
4. blocked readiness then Pilot Ready after authorized sign-off
5. withdraw commitment → automatic Review Required (hero moment)
6. restore commitment
7. completed pilot with denominator mismatch → Inconclusive
8. dashboard/next action

For each step provide: speaker line, click/action, expected UI state, fallback if the action fails. Keep claims limited to synthetic demo evidence.
```

**Acceptance Gate:** Team can execute under 5 minutes consistently; hero interaction and honest outcome are unmistakable.

## P60 — Post-Release / Next Validation Backlog

**Goal:** Hackathon MVP ke baad startup/gov product path ko evidence-led rakhna.

**Owner:** Product / Tech Lead

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Create the post-MVP backlog without expanding features blindly. Separate:
A. validation needed before product claims: independent gold review, real/anonymized cases, human timing, stakeholder/owner validation, B1 plain-LLM comparison if still relevant;
B. production integrations requiring authorization: identity/SSO, government systems, official HEI/resource registries;
C. engineering hardening: storage, notifications, SLA jobs, observability, privacy controls;
D. feature candidates only after evidence.

Rank by expected learning/value, not novelty.
```

**Acceptance Gate:** Roadmap prioritizes evidence and adoption blockers before new flashy features.

# Helper / Recovery Prompts

## H01 — Bug Debug Prompt

**Goal:** Kisi specific bug ko controlled way me fix karna.

**Owner:** Tech Lead / relevant role

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Bug: [PASTE BUG]
Expected behavior: [EXPECTED]
Actual behavior: [ACTUAL]
Relevant route/API: [ROUTE]

Reproduce first. Trace from UI → network → router → service/rules → DB. Identify root cause, not just symptom. Add or update a regression test that fails before the fix and passes after. Make the smallest safe change. Run relevant tests and report exactly what changed.
```

**Acceptance Gate:** Bug is reproducible, regression test exists, root cause is fixed.

## H02 — Code Review Prompt

**Goal:** PR merge se pehle independent review karna.

**Owner:** Tech Lead / relevant role

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Review the current diff/PR for correctness against NIRNAY locked rules. Focus on business-state correctness, authorization, data integrity, stale/idempotent writes, audit history, error handling, accessibility, test gaps and unnecessary complexity.

Do not rewrite code just for style. Return findings by severity: BLOCKER, HIGH, MEDIUM, LOW. For each finding include file/location, why it matters, and a concrete fix. If clean, state what you verified.
```

**Acceptance Gate:** No unresolved BLOCKER/HIGH finding remains before merge.

## H03 — Frontend Screen QA Prompt

**Goal:** Ek screen ko UI/UX jury lens se inspect karna.

**Owner:** Tech Lead / relevant role

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Audit this screen: [SCREEN/ROUTE]. Evaluate hierarchy, role clarity, current status, blocker/owner/next action visibility, evidence traceability, empty/loading/error states, mobile responsiveness, keyboard/focus, status color+text, copy clarity and generic-template feel.

Return: keep, change now (P0/P1), polish later. Then implement only P0/P1 fixes and re-test at 1280 and 390 widths.
```

**Acceptance Gate:** Screen communicates its business purpose and next action without explanation.

## H04 — Database Migration Review Prompt

**Goal:** Schema change safely validate karna.

**Owner:** Tech Lead / relevant role

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Review the proposed schema/migration change: [CHANGE]. Check backwards compatibility, null/default strategy, enum evolution, indexes, data migration, rollback risk, audit/history preservation and effect on seeded demo.

If safe, implement migration plus tests. If destructive, propose a staged migration instead. Do not edit historical migration files already applied to shared environments.
```

**Acceptance Gate:** Migration succeeds on empty DB and upgraded existing test DB; rollback/forward plan is documented.

## H05 — AI Prompt Evaluation Prompt

**Goal:** LLM prompt ko hallucination/authority risk par test karna.

**Owner:** Tech Lead / relevant role

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Evaluate this AI prompt/use case: [PASTE]. Build a small adversarial test set including missing facts, contradictory evidence, Hindi/Hinglish, irrelevant attachment text, prompt injection, unknown owner/capacity/permission and ambiguous route.

Measure schema validity and whether the model invents restricted facts/authority. Revise the prompt/schema only where failures are observed. Keep deterministic fallback.
```

**Acceptance Gate:** Prompt never auto-approves protected states and unsupported facts become null/unknown.

## H06 — Release Blocker Triage Prompt

**Goal:** Last-minute bugs ko impact ke hisaab se decide karna.

**Owner:** Tech Lead / relevant role

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Triage these open issues before release: [PASTE ISSUES]. Classify P0/P1/P2 using impact on golden flow, data integrity, security, judge comprehension and recoverability.

Recommend: fix now, workaround, or defer. Do not spend time on cosmetic P2 if any P0/P1 remains. Produce an ordered action list with owner and verification step.
```

**Acceptance Gate:** Team has one prioritized release queue and no critical issue is hidden behind polish.

## H07 — Context Drift Reset

**Goal:** Long AI coding session mein product rules drift hone par context reset karna.

**Owner:** Tech Lead

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

Stop implementation. Compare the current repository behavior and the last agent plan against the locked source authority and state machines. List any drift in enums, authority, readiness rules, AI boundaries, synthetic-data claims or P2 behavior.

Produce a minimal correction plan. Do not rewrite unrelated code. After corrections, rerun the relevant golden tests and restate the locked context in 12 bullets maximum.
```

**Acceptance Gate:** Agent/repo behavior is back within locked product boundaries and relevant regression tests pass.

## H08 — Spec Conflict Resolver

**Goal:** Do documents/repo mein contradiction aaye to guess na karna.

**Owner:** Tech Lead + Product Owner

```text
Continue under the locked NIRNAY C00 Master Context. If this is a new AI/coding session, paste/run C00 first.

A conflict has been found: [PASTE CONFLICT].

Classify each conflicting statement by authority domain:
- official requirement
- product decision
- workflow/rule specification
- validation evidence
- implementation recommendation
- explanatory text.

State which source controls this specific question and why. If the conflict is still unresolved because it needs a real policy/owner decision, add it to the unresolved-policy register and propose the safest reversible implementation default. Do not silently merge incompatible rules.
```

**Acceptance Gate:** Conflict is either resolved by correct authority or explicitly remains an open policy item with a reversible implementation boundary.

# Final Build Order — One Line

**C00 context → source/scope lock → repo/bootstrap → reproducible versions → TRL3 persistence/reuse gate → domain contracts → config/schema/seed → FastAPI/OpenAPI type sync → RBAC/audit → challenge/evidence/storage → qualification/passport → frontend core → HEI/commitments/expiry → readiness/dependency invalidation → pilot evidence/outcome → AI assistance → dashboard/reset → unit/API/adversarial/E2E → accessibility/low-bandwidth → threat/security/performance → containers/CI/staging → production-auth boundary/observability → backup + restore drill → privacy/config hardening → technical audit + explicit Government-production GO/NO-GO → release docs → jury demo → real-world validation backlog.**
