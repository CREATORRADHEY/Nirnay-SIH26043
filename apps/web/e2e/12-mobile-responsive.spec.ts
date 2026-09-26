import { test, expect } from "@playwright/test";

/**
 * NIRNAY P0 Mobile Responsiveness Audit Suite (Unmasked Layout Verification)
 * Validates zero horizontal page scroll (scrollWidth <= innerWidth) WITHOUT relying on page-level clipping.
 * Covers all 8 mobile/tablet target viewports:
 * 320px, 360px, 375px, 390px, 393px, 412px, 430px, 768px
 */

const TARGET_VIEWPORTS = [
  { width: 320, height: 568, name: "320px (iPhone SE 1st Gen)" },
  { width: 360, height: 800, name: "360px (Android Standard)" },
  { width: 375, height: 667, name: "375px (iPhone SE 2nd/3rd Gen)" },
  { width: 390, height: 844, name: "390px (iPhone 12/13/14 Pro)" },
  { width: 393, height: 852, name: "393px (iPhone 15 Pro / Pixel 7)" },
  { width: 412, height: 915, name: "412px (Samsung Galaxy S23/S24)" },
  { width: 430, height: 932, name: "430px (iPhone 14/15 Pro Max)" },
  { width: 768, height: 1024, name: "768px (iPad / Tablet Portrait)" },
];

const PUBLIC_ROUTES = ["/", "/login", "/register", "/challenges"];

const AUTH_ROUTES = [
  "/app",
  "/app/challenges",
  "/app/challenges/new",
  "/app/review",
  "/app/qualification",
  "/app/hei-matching",
  "/app/commitments",
  "/app/readiness",
  "/app/pilots",
  "/app/outcomes",
  "/app/evaluation",
];

test.describe("NIRNAY P0 Mobile Responsiveness Audit (No Global Clip Mask)", () => {
  // Test Public Routes across all viewports
  for (const vp of TARGET_VIEWPORTS) {
    test.describe(`Viewport ${vp.name}`, () => {
      test.use({ viewport: { width: vp.width, height: vp.height } });

      for (const route of PUBLIC_ROUTES) {
        test(`Public Route [${route}] fits ${vp.width}px with zero page overflow`, async ({ page }) => {
          await page.goto(route);
          await page.waitForLoadState("domcontentloaded");

          const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
          const innerWidth = await page.evaluate(() => window.innerWidth);

          expect(scrollWidth, `Route ${route} has horizontal overflow on ${vp.name}`).toBeLessThanOrEqual(innerWidth);
        });
      }
    });
  }

  // Test Authenticated Judge-Facing Journey Routes (using 390px SIH Judge target & key viewports)
  test.describe("Authenticated Judge Journey Routes (390px Target)", () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test.beforeEach(async ({ page }) => {
      // Perform demo login to populate authenticated session state
      await page.goto("/login");
      await page.fill("input[type='email']", "gov.admin@nirnay.gov.in");
      await page.fill("input[type='password']", "any");
      await page.click("button[type='submit']");
      await page.waitForTimeout(500);
    });

    for (const route of AUTH_ROUTES) {
      test(`Authenticated Judge Route [${route}] fits 390px with zero page overflow`, async ({ page }) => {
        await page.goto(route);
        await page.waitForLoadState("domcontentloaded");

        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        const innerWidth = await page.evaluate(() => window.innerWidth);

        expect(scrollWidth, `Authenticated route ${route} has horizontal overflow at 390px`).toBeLessThanOrEqual(innerWidth);
      });
    }
  });

  // Specifically validate complete 390px SIH Judge Navigation Journey
  test("Complete 390px SIH Judge QR Journey Flow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    // Step 1: Scan QR / Landing Page
    await page.goto("/");
    await expect(page.locator("h1").first()).toBeVisible();
    let scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(390);

    // Step 2: Explore Public Directory
    await page.goto("/challenges");
    await page.waitForLoadState("domcontentloaded");
    scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(390);

    // Step 3: Login to Product Dashboard
    await page.goto("/login");
    await page.fill("input[type='email']", "gov.admin@nirnay.gov.in");
    await page.fill("input[type='password']", "any");
    await page.click("button[type='submit']");
    await page.waitForTimeout(500);

    // Step 4: Dashboard
    await page.goto("/app");
    scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(390);

    // Step 5: Qualification
    await page.goto("/app/qualification");
    scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(390);

    // Step 6: HEI Matching
    await page.goto("/app/hei-matching");
    scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(390);

    // Step 7: Pilot Readiness
    await page.goto("/app/readiness");
    scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(390);

    // Step 8: Outcome Review
    await page.goto("/app/outcomes");
    scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(390);
  });
});
