import { test, expect } from "@playwright/test";

/**
 * NIRNAY HEI & Industry Workflow E2E
 * Tests HEI matching and Commitments routes, client-side route guards, and rendering.
 */

test.describe("HEI & Industry Workflow Route Guards", () => {
  test.setTimeout(20_000);

  test("/app/hei-matching redirects unauthenticated user to /login", async ({ page }) => {
    await page.goto("/app/hei-matching");
    await page.waitForURL(/login|register/, { timeout: 12_000 });
    await expect(page).toHaveURL(/login|register/);
  });

  test("/app/commitments redirects unauthenticated user to /login", async ({ page }) => {
    await page.goto("/app/commitments");
    await page.waitForURL(/login|register/, { timeout: 12_000 });
    await expect(page).toHaveURL(/login|register/);
  });
});
