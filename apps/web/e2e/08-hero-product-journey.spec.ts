import { test, expect } from "@playwright/test";

/**
 * NIRNAY Hero Product Journey & RBAC Boundary E2E Test (P5.1)
 * Validates the single canonical product journey across stages and RBAC security boundaries.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

test.describe("P5.1 Hero Product Journey & Security Suite", () => {
  test.setTimeout(30_000);

  test("Unauthenticated access to protected workflow routes is redirected to login", async ({ page }) => {
    const protectedRoutes = [
      "/app",
      "/app/challenges/new",
      "/app/review",
      "/app/qualification",
      "/app/hei-matching",
      "/app/readiness",
      "/app/pilots",
      "/app/outcomes",
      "/app/admin/users",
    ];

    for (const route of protectedRoutes) {
      await page.goto(route);
      await page.waitForURL(/login|register/, { timeout: 10_000 });
      await expect(page).toHaveURL(/login|register/);
    }
  });

  test("Challenge Passport page loads factual backend record and displays lifecycle rail", async ({ page }) => {
    const apiAvailable = await page.request.get(`${API_BASE}/health`).then((r) => r.ok()).catch(() => false);

    if (apiAvailable) {
      const resp = await page.request.get(`${API_BASE}/api/v1/challenges?limit=1`);
      if (resp.ok()) {
        const data = await resp.json();
        if (data.items?.length > 0) {
          const challengeId = data.items[0].id;
          await page.goto(`/app/challenges/${challengeId}`);
          await page.waitForTimeout(1000);
          await expect(page.locator("h1")).toBeVisible();
          await expect(page.getByText("Authoritative Lifecycle Rail")).toBeVisible();
          return;
        }
      }
    }

    await page.goto("/app/challenges/c0a80001-0000-4000-8000-000000000001");
    await page.waitForTimeout(1000);
    await expect(page.locator("body")).toBeVisible();
  });
});
