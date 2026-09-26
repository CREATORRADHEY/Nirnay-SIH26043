# System Architecture — NIRNAY

## 1. Top-Level Architecture Diagram

```mermaid
graph TD
    Client[Web Browser / Client] -->|HTTPS / Next.js UI| Vercel[Vercel Frontend Host - Next.js 16.3.5]
    Vercel -->|Next.js Rewrites /api/v1/* Proxy| Render[Render Backend Host - FastAPI 0.116.1]
    
    subgraph FastAPI Backend Core
        Render --> Auth[Auth & Session Engine - Argon2id]
        Render --> Gate[Qualification & Readiness Engine]
        Render --> Audit[Decision Assurance & Security Audit Log]
        Render --> AIService[AI Assistance Service]
    end
    
    FastAPI Backend Core -->|SQLAlchemy 2.0 / psycopg3| PostgreSQL[(PostgreSQL Database - Render Managed)]
    AIService -->|Non-authoritative Prompt| Gemini[Gemini API / Configured AI Provider]
    Render -->|Local Ephemeral / S3 Adapter| Storage[Evidence Storage Adapter]
```

---

## 2. Component Subsystems

### A. Frontend Layer (Vercel)
- Built with **Next.js 16.3.5** (App Router) and **React 19.2.8**.
- TailwindCSS `^4.0` for responsive styling.
- Lucide React for consistent icon language.
- Client-side i18n support across 8 languages (EN, HI, TA, TE, MR, GU, BN, KN).
- Next.js rewrite proxy forwards `/api/v1/*` requests to the FastAPI backend, ensuring same-origin cookie transmission and avoiding CORS complications.

### B. API Backend Layer (Render)
- Built with **FastAPI 0.116.1** running on **Uvicorn 0.35.0** (Python 3.11 / 3.13).
- Structured API versioning under `/api/v1/`.
- Dependency injection handles authentication, database sessions (`get_db`), and authorization context (`get_current_actor`).
- Strict error handling with standard JSON problem detail responses.

### C. Database Layer (PostgreSQL)
- **SQLAlchemy 2.0.43** ORM with `psycopg3` (`3.2.10`) driver.
- Managed schema migrations using **Alembic 1.16.5** (`001_identity_foundation.py` to `013_decision_assurance.py`).
- Transactional integrity guarantees for multi-step state changes (such as automatic readiness invalidations).

### D. Bounded AI Assistance Subsystem
- Decoupled `ai_assistance` module interfacing with Gemini API or fallback mock providers.
- Strict non-authoritative boundary: AI generates suggestions, extractions, and duplicate summaries, but cannot execute database mutations or governance decisions.

### E. Storage Subsystem
- Abstracted file storage interface (`storage_provider`).
- Supports `local` ephemeral file storage for MVP development/demonstrations and S3-compatible object storage for production deployments.
