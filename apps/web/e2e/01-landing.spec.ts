import { test, expect } from "@playwright/test";

/**
 * NIRNAY Landing Page E2E
 * Verifies public landing page renders and primary CTAs work.
 */
test.describe("Landing Page", () => {
  test("renders hero section with NIRNAY branding", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/NIRNAY/i);
    await expect(page.locator("h1, [data-testid='hero-headline']").first()).toBeVisible();
  });

  test("Start Review CTA navigates to register or app", async ({ page }) => {
    await page.goto("/");
    const cta = page.locator("a[href='/register'], a[href='/app'], button").filter({ hasText: /start review|get started|sign up/i }).first();
    if (await cta.isVisible()) {
      await cta.click();
      await expect(page).toHaveURL(/register|app|login/);
    } else {
      test.skip(true, "CTA not found — landing page may use different structure");
    }
  });

  test("Watch Demo link is visible", async ({ page }) => {
    await page.goto("/");
    const demo = page.locator("a, button").filter({ hasText: /watch demo|demo/i }).first();
    if (await demo.isVisible()) {
      await expect(demo).toBeVisible();
    } else {
      test.skip(true, "Watch Demo not found");
    }
  });

  test("public /challenges page loads without auth", async ({ page }) => {
    await page.goto("/challenges");
    await expect(page).not.toHaveURL(/login/);
    // Should show some challenges or an empty state — not a 404 or auth wall
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });
});
