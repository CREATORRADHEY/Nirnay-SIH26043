# Local Development Guide — NIRNAY

## 1. Environment Setup

### Prerequisites
- **Python**: `3.11` or `3.13`
- **Node.js**: `v20.x` or higher
- **PostgreSQL**: `15+` (or Docker Desktop)
- **Git**: `2.30+`

---

## 2. Step-by-Step Setup

### Step 1: Clone Repository
```bash
git clone https://github.com/CREATORRADHEY/Nirnay-SIH26043.git
cd Nirnay-SIH26043
```

### Step 2: Backend API Setup (`apps/api`)
```bash
cd apps/api

# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables (optional .env override)
cp .env.example .env

# Run Alembic migrations
alembic upgrade head

# Start Uvicorn development server
uvicorn app.main:app --reload --port 8000
```
Backend API will be running at `http://localhost:8000`. OpenAPI documentation available at `http://localhost:8000/docs`.

### Step 3: Frontend Web App Setup (`apps/web`)
In a new terminal window:
```bash
cd apps/web

# Install dependencies
npm install

# Start Next.js development server
npm run dev
```
Web application will be running at `http://localhost:3000`.

---

## 3. Local Verification Commands

```bash
# Backend unit tests
cd apps/api && source .venv/bin/activate && pytest app/tests

# Frontend unit tests
cd apps/web && npm test -- --run

# TypeScript typecheck
cd apps/web && npm run typecheck

# Production build check
cd apps/web && npm run build
```
