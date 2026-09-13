# NIRNAY — P2 API Authorization & Endpoint Matrix

## 1. Auth & Session Rules
- **Authentication Method**: HTTP-only secure cookie (`nirnay_session`) backed by `auth_sessions` database table.
- **Actor Resolution**: Server-side resolution of `Account` -> `Actor` on every protected request via `get_current_actor` dependency.
- **Role Enforcement**: `PolicyService.can_perform_action(current_actor, permission)`.

---

## 2. API Endpoint Matrix

| Endpoint | HTTP Method | Allowed Roles / Permissions | Description |
| :--- | :---: | :--- | :--- |
| `/api/v1/challenges` | `POST` | `COMMUNITY_REPORTER`, `GOVERNMENT_ADMIN`, `PLATFORM_ADMIN` | Submit a new Challenge Passport record |
| `/api/v1/me/challenges` | `GET` | Any Authenticated Actor | List challenges submitted by current logged-in user |
| `/api/v1/challenges/{id}/evidence/upload` | `POST` | `COMMUNITY_REPORTER` (owner), `GOVERNMENT_REVIEWER` | Upload evidence file (PDF, PNG, JPG, MP4) up to 10MB |
| `/api/v1/evidence/{id}/file` | `GET` | Any Authenticated Actor | Securely download/stream uploaded evidence file |
| `/api/v1/challenges/{id}/clarifications` | `POST` | `GOVERNMENT_REVIEWER`, `GOVERNMENT_ADMIN` | Request clarification on a challenge |
| `/api/v1/challenges/{id}/clarifications` | `GET` | Any Authenticated Actor | List clarification threads and responses for a challenge |
| `/api/v1/clarifications/{id}/respond` | `POST` | Submitter of Challenge or Target Actor | Submit response to a clarification request |
| `/api/v1/clarifications/{id}/resolve` | `POST` | `GOVERNMENT_REVIEWER`, `GOVERNMENT_ADMIN` | Resolve/close a clarification request |
| `/api/v1/government/review-queue` | `GET` | `GOVERNMENT_REVIEWER`, `GOVERNMENT_ADMIN` | Filtered review queue with multi-param search & statistics |
| `/api/v1/notifications` | `GET` | Any Authenticated Actor | Get in-app notifications for logged-in user |
| `/api/v1/notifications/{id}/read` | `POST` | Notification Owner | Mark single notification as read |
| `/api/v1/notifications/read-all` | `POST` | Any Authenticated Actor | Mark all notifications as read for current user |

---

## 3. Evidence Storage Policy
- **Local Storage Adapter**: Files saved under `storage/uploads/{uuid}_{filename}`.
- **Validation**:
  - File extension & MIME type checked against whitelist (`application/pdf`, `image/png`, `image/jpeg`, `video/mp4`).
  - Max size enforced: 10,485,760 bytes (10MB).
- **IDOR Protection**: Only file owner or authorized government reviewer can download evidence files.
