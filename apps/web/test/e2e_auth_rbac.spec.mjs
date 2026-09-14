// Playwright End-to-End Specification for Auth & RBAC Security Closure
export const e2eSpec = {
  name: "Production Foundation P1 Auth & RBAC E2E Suite",
  flows: [
    "1. Register citizen -> /register",
    "2. View Dashboard -> /app",
    "3. View Account Security & Sessions -> /app/account/security",
    "4. Change Password & Revoke Sessions",
    "5. Logout & 401 verification"
  ]
};
