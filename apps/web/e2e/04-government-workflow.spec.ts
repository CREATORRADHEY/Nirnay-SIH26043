import { test, expect } from "@playwright/test";

/**
 * NIRNAY Government Workflow E2E
 * Tests government-only routes enforce RBAC via client-side auth redirect.
 *
 * The AppShell does client-side redirect: after session check, unauthenticated
 * users are sent to /login. Use waitForURL to account for async redirect.
 */

test.describe("Government Workflow Route Guards", () => {
  test.setTimeout(20_000);

  const protectedRoutes = [
    "/app/review",
    "/app/qualification",
    "/app/hei-matching",
    "/app/pilots",
    "/app/outcomes",
    "/app/readiness",
    "/app/notifications",
  ];

  for (const route of protectedRoutes) {
    test(`${route} redirects unauthenticated user to /login`, async ({ page }) => {
      await page.goto(route);
      // Wait for client-side auth redirect to complete
      await page.waitForURL(/login|register/, { timeout: 12_000 });
      await expect(page).toHaveURL(/login|register/);
    });
  }
});
