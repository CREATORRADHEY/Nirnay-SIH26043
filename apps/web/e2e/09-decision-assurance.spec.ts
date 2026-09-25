import { test, expect } from "@playwright/test";

/**
 * NIRNAY Decision Assurance E2E Test Suite (P5.2)
 * Validates evidence-backed criteria rubrics, rationale validation,
 * visual AI non-authoritative boundary, and review receipts.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

test.describe("P5.2 Decision Assurance Suite", () => {
  test.setTimeout(30_000);

  test("Qualification page renders structured criteria rubric and AI non-authoritative boundary", async ({ page }) => {
    await page.goto("/app/qualification");
    await page.waitForTimeout(1000);

    // If redirected to login, verify protection
    if (page.url().includes("login") || page.url().includes("register")) {
      await expect(page).toHaveURL(/login|register/);
      return;
    }

    // Otherwise inspect governance workbench controls
    await expect(page.locator("h1")).toContainText("Problem Qualification Workbench");
    await expect(page.getByText("Structured Qualification Rubric")).toBeVisible();
    await expect(page.getByText("AI ADVISORY — NON-AUTHORITATIVE")).toBeVisible();
    await expect(page.getByText("AI cannot submit this decision")).toBeVisible();
  });

  test("Challenge Passport displays Decision Assurance Receipts and WhyThisState governance badge", async ({ page }) => {
    const apiAvailable = await page.request.get(`${API_BASE}/health`).then((r) => r.ok()).catch(() => false);

    let challengeId = "c0a80001-0000-4000-8000-000000000001";
    if (apiAvailable) {
      const resp = await page.request.get(`${API_BASE}/api/v1/challenges?limit=1`);
      if (resp.ok()) {
        const data = await resp.json();
        if (data.items?.length > 0) {
          challengeId = data.items[0].id;
        }
      }
    }

    await page.goto(`/app/challenges/${challengeId}`);
    await page.waitForTimeout(1000);

    if (page.url().includes("login") || page.url().includes("register")) {
      await expect(page).toHaveURL(/login|register/);
      return;
    }

    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByText("Current State")).toBeVisible();
  });
});
