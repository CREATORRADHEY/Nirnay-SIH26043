# Security Model — NIRNAY

## 1. Defense-in-Depth Topology

NIRNAY enforces a multi-layered security architecture designed for public sector deployment:

```mermaid
graph TD
    Client[Client / Browser] -->|TLS / HTTPS| ReverseProxy[Vercel Next.js Proxy]
    ReverseProxy -->|HttpOnly Cookie / SameSite Lax| API[FastAPI Backend Gateway]
    
    subgraph Security Layer
        API --> CSRF[CSRF Protection Filter]
        API --> Auth[Argon2id Session Authentication]
        API --> RBAC[Multi-Tenant RBAC Authorization]
        API --> IDOR[IDOR & Organization Boundary Check]
    end
    
    Security Layer --> Data[(PostgreSQL DB)]
    Security Layer --> Audit[(Security Audit Log)]
```

---

## 2. Primary Security Controls

1. **Authentication Integrity**: Password hashing using **Argon2id** (`argon2-cffi 23.1.0`), resisting GPU cracking and side-channel timing attacks.
2. **Session Security**: Cryptographically strong session tokens stored in `AuthSession` with server-side expiration tracking.
3. **Cookie Security**:
   - `SESSION_COOKIE_SECURE`: Automatically enabled in `production` and `staging` environments (`Secure` flag).
   - `SESSION_COOKIE_SAMESITE`: Configured to `Lax` to prevent cross-site request forgery while supporting normal navigation.
   - `HttpOnly`: Prevents client-side JavaScript access to session tokens.
4. **Organization Boundary Isolation (IDOR Prevention)**: Requests targeting organization-specific resources (e.g., HEI commitments or Nodal review queues) verify that the authenticated actor's `organization_id` matches the target entity.
5. **Security Audit Logging**: All sensitive security events (login attempts, password resets, role switches, organization modifications) are recorded to the `SecurityAuditLog` table with IP address and user-agent metadata.
