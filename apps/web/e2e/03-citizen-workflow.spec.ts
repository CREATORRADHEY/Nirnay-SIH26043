import { test, expect } from "@playwright/test";

/**
 * NIRNAY Citizen Workflow E2E
 * Tests challenge browsing (public) and auth-gated citizen pages.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

test.describe("Citizen Workflows", () => {
  test("public challenges page renders without authentication", async ({ page }) => {
    await page.goto("/challenges");
    await expect(page).not.toHaveURL(/login/);
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("challenge detail page renders with valid challenge ID", async ({ page }) => {
    const apiAvailable = await page.request.get(`${API_BASE}/health`).then(r => r.ok()).catch(() => false);

    if (apiAvailable) {
      const resp = await page.request.get(`${API_BASE}/api/v1/challenges?limit=1`);
      if (resp.ok()) {
        const data = await resp.json();
        if (data.items?.length > 0) {
          const challengeId = data.items[0].id;
          await page.goto(`/challenges/${challengeId}`);
          await expect(page.locator("h1, h2").first()).toBeVisible();
          return;
        }
      }
    }

    await page.goto("/challenges/c0010000-0000-0000-0000-000000000001");
    await expect(page).not.toHaveURL(/login/);
  });

  test("notifications page redirects unauthenticated user to login", async ({ page }) => {
    await page.goto("/app/notifications");
    // Client-side redirect — wait for it
    await page.waitForURL(/login|register/, { timeout: 12_000 });
    await expect(page).toHaveURL(/login|register/);
  });
});
