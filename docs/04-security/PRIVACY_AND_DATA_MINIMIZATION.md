# Privacy & Data Minimization — NIRNAY

## 1. Data Minimization Principles

In compliance with public sector data governance practices, NIRNAY practices strict data minimization:

1. **Essential Profile Data Only**: User accounts store only necessary identification fields (`email`, `display_name`, `platform_role`, `organization_id`). No unnecessary personal demographic data is collected.
2. **Citizen Anonymity Option**: Challenge submissions allow citizens to report localized civic issues while marking personal contact details as private from public directories.
3. **Public Directory Redaction**: Public Challenge Passports (`/challenges/[id]`) display spatial data, domain categories, and evidence photos, but hide reporter phone numbers and internal administrative notes.

---

## 2. Secret & Credential Sanitization

- **Zero Hardcoded Credentials**: API secrets (`AI_API_KEY`, `DATABASE_URL`, `SESSION_SECRET`) are loaded exclusively from environment variables via Pydantic `BaseSettings`.
- **Database Connection Sanitization**: `DATABASE_URL` strings are automatically sanitized on startup to strip whitespace, extra quotes, and convert legacy `postgresql://` schemes to `postgresql+psycopg://`.
- **Audit Masking**: System logs mask sensitive user input and credential tokens to prevent accidental log leakage.
