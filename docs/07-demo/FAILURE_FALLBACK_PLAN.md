# Failure Fallback Plan — NIRNAY

## 1. Contingency Matrix for Live Presentations

During live hackathon evaluations, technical or network issues can arise. This fallback plan details immediate mitigation steps:

| Potential Failure Scenario | Primary Mitigation Action | Secondary Fallback |
| :--- | :--- | :--- |
| **Render Backend Cold Start (Delay > 15s)** | Run warm-up ping 60 seconds before demo: `curl -s https://nirnay-sih26043.onrender.com/health` | Explain Render free-tier spin-up; transition to local frontend fallback datasets (`NEXT_PUBLIC_ENABLE_DEMO_FALLBACK=true`). |
| **Internet / API Connectivity Loss** | Launch local offline environment (`http://localhost:3000` & `http://localhost:8000`). | Use client-side fallback dataset embedded in Next.js web build. |
| **External Gemini AI API Rate Limit** | Toggle AI provider to local mock service (`AI_PROVIDER=disabled`). | Explain AI boundary principle (*AI Proposes → Human Authorizes*) using synthetic mock suggestions. |
| **Binary Evidence File Upload Error** | Demonstrate evidence metadata record and hash verification. | Explain MVP ephemeral storage boundary; highlight structured workflow persistence in PostgreSQL. |

---

## 2. Local Fallback Mode (`NEXT_PUBLIC_ENABLE_DEMO_FALLBACK`)

The Next.js frontend API client (`apps/web/src/lib/api.ts`) includes a client-side fallback engine. If backend HTTP requests fail or return network errors during demo mode, `api.ts` gracefully falls back to pre-seeded static challenge datasets (`DEMO_CHALLENGES`), allowing the full UI, Challenge Passport, and Guided Mission Mode to operate without crashing.
