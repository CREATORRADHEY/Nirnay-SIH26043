# NIRNAY

Societal Innovation Collaboration & Readiness Platform

Smart India Hackathon 2026  
Problem Statement: SIH26043  
Team: CREATORZZZ

Tagline:  
Right Problem. Ready Pilot. Proven Outcome.

## 1. What NIRNAY is

NIRNAY is the official SIH26043 repository for building a societal innovation collaboration and pilot-readiness platform in controlled, incremental phases.

## 2. Current repository status

This repository is currently bootstrapped with:
- a minimal Next.js frontend placeholder
- a minimal FastAPI backend with `GET /health`
- PostgreSQL local development setup via Docker Compose
- CI checks for frontend and backend basics

No product workflows or domain features are implemented in this bootstrap phase.

## 3. Architecture overview

Monorepo layout:
- `apps/web`: Next.js + React + TypeScript + Tailwind frontend
- `apps/api`: FastAPI + Pydantic + SQLAlchemy + Alembic backend
- `packages/contracts`: reserved for shared contracts across apps
- `data/seed`, `data/fixtures`: seed and fixture placeholders

## 4. Repository structure

```text
nirnay-sih26043/
├── apps/
│   ├── web/
│   └── api/
├── packages/
│   └── contracts/
├── data/
│   ├── seed/
│   └── fixtures/
├── docs/
├── infra/
├── scripts/
├── .github/
│   └── workflows/
├── .env.example
├── .gitignore
├── docker-compose.yml
└── README.md
```

## 5. Prerequisites

- Node.js 20+
- npm 10+
- Python 3.12+
- pip
- Docker + Docker Compose plugin

## 6. Local setup

```bash
cp .env.example .env
bash scripts/local-setup.sh
```

## 7. Running frontend

```bash
cd apps/web
npm install
npm run dev
```

Also available:

```bash
npm run lint
npm run typecheck
npm run build
```

## 8. Running backend

```bash
cd apps/api
python -m pip install -r requirements.txt -r requirements-dev.txt
uvicorn app.main:app --reload
```

Health check endpoint:

```bash
curl http://127.0.0.1:8000/health
```

## 9. Running PostgreSQL

```bash
docker compose up -d postgres
```

Default local database container:
- host: `localhost`
- port: `5432`
- db: `nirnay`
- user: `postgres`
- password: `postgres`

## 10. Environment variables

See `.env.example`:
- `DATABASE_URL`
- `AI_PROVIDER`
- `AI_API_KEY`
- `DEMO_MODE`
- `CORS_ORIGINS`

## 11. Testing

Frontend checks:

```bash
cd apps/web
npm run lint
npm run typecheck
npm run build
```

Backend tests:

```bash
cd apps/api
pytest
```

## 12. Important prototype disclaimer

This repository is currently an SIH prototype under development.
Demo or seeded data must not be interpreted as real Government of Jharkhand data, deployment, endorsement, or measured public impact.
