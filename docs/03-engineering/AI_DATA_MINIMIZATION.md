# NIRNAY AI Data Minimization & Privacy Governance Specification

**Project:** NIRNAY — Societal Innovation Collaboration & Readiness Platform  
**Problem Statement:** SIH26043  
**Team:** CREATORZZZ  
**Phase:** P5.3 AI Clarity + Practical Evaluation Architecture  

---

## 1. Overview & Data Minimization Policy

NIRNAY enforces strict **privacy by design** and **data minimization** for all AI assistance capabilities. 

AI providers receive **only the minimal text and metadata strictly required** to generate non-authoritative advisory suggestions.

### Strictly Prohibited from LLM Contexts:
- User session tokens, JWTs, password hashes
- PII (phone numbers, email addresses, personal identification numbers are sanitized prior to prompt construction)
- Database credentials, internal API keys, infrastructure secret tokens
- Internal authorization policies or role permission definitions

---

## 2. Capability Field Attribution Table

| Canonical Category | API Endpoint | Included Input Fields | Sanitized / Redacted Fields | Non-Included Private Data |
|---|---|---|---|---|
| **STRUCTURE** | `POST /api/v1/ai/challenges/extract` | Raw problem text submitted by citizen | Phone numbers, emails, PII regex redacted | Session cookies, user identity tokens |
| **SUMMARIZE** | `POST /api/v1/ai/challenges/{id}/evidence-summary` | Challenge title, evidence summaries | File storage paths, uploader PII | Internal DB UUIDs, system logs |
| **SUGGEST** | `POST /api/v1/ai/challenges/{id}/qualification-suggestion` | Challenge title, summary, description, evidence text | Citizen PII, submitter account IDs | Internal reviewer comments, auth roles |
| **SUGGEST** | `POST /api/v1/ai/challenges/{id}/hei-candidate-suggestion` | Challenge title, description, domain, registered HEI capability names | HEI faculty PII, internal contact emails | Institutional funding totals, private MOU text |
| **FIND PATTERNS** | `POST /api/v1/ai/challenges/{id}/duplicate-suggestion` | Challenge title, description, district, domain | Submitter PII, exact geo-coordinates | Internal review queue notes |

---

## 3. PII Redaction & Sanitizer Architecture

The `AISanitizer` service (`apps/api/app/services/ai/sanitizer.py`) processes all incoming text streams before context construction:

1. **Indian Mobile Numbers**: `+91` / 10-digit regex matching → `[REDACTED_PHONE]`
2. **Email Addresses**: Standard RFC 5322 regex → `[REDACTED_EMAIL]`
3. **Aadhaar / National IDs**: 12-digit sequence matching → `[REDACTED_ID]`

---

## 4. Operational Audit Logging Policy

All AI calls log lightweight operational telemetry to the `ai_audit_logs` table (`AIAuditLog`):
- `task_type` (`STRUCTURE`, `SUMMARIZE`, `SUGGEST`, `FIND_PATTERNS`)
- `prompt_version` (e.g., `qualification_suggestion_v1`)
- `actor_id` (Caller reference ID)
- `provider` & `model`
- `success` (Boolean)
- `latency_ms` (Integer)

**Zero raw prompt text or model reasoning is stored in audit logs.**
