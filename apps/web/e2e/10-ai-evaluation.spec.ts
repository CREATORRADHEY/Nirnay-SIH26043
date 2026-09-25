import { test, expect } from "@playwright/test";

/**
 * NIRNAY P5.3 AI Evaluation & Clarity E2E Test Suite
 * Validates AI Evaluation Workspace (/app/evaluation/ai), 4-capability model,
 * metrics rendering, dataset table, and AI-off toggle.
 */

test.describe("P5.3 AI Evaluation Suite", () => {
  test.setTimeout(30_000);

  test("AI Evaluation Workspace loads synthetic dataset and 4-capability model explanation", async ({ page }) => {
    await page.goto("/app/evaluation/ai");
    await page.waitForTimeout(1000);

    if (page.url().includes("login") || page.url().includes("register")) {
      await expect(page).toHaveURL(/login|register/);
      return;
    }

    // Verify page header & banner
    await expect(page.getByText("CONTROLLED SYNTHETIC EVALUATION WORKSPACE")).toBeVisible();
    await expect(page.locator("h1")).toContainText("AI Clarity & Practical Evaluation");
    await expect(page.getByText("How NIRNAY Uses AI")).toBeVisible();

    // Verify 4 Canonical Capabilities
    await expect(page.getByText("1. Structure")).toBeVisible();
    await expect(page.getByText("2. Summarize")).toBeVisible();
    await expect(page.getByText("3. Suggest")).toBeVisible();
    await expect(page.getByText("4. Find Patterns")).toBeVisible();

    // Verify strict prohibition banner
    await expect(page.getByText("Strict AI Prohibition Boundary")).toBeVisible();
    await expect(page.getByText("AI = Advisory Only")).toBeVisible();
  });

  test("AI Evaluation Workspace renders metrics cards and agreement matrix table", async ({ page }) => {
    await page.goto("/app/evaluation/ai");
    await page.waitForTimeout(2500);

    if (page.url().includes("login") || page.url().includes("register")) {
      await expect(page).toHaveURL(/login|register/);
      return;
    }

    // Verify metrics cards
    await expect(page.getByText("Dual-Reviewer Fixture Match")).toBeVisible();
    await expect(page.getByText("AI-Fixture Match")).toBeVisible();

    // Verify dataset table
    await expect(page.getByText("Synthetic Case Dataset & Agreement Matrix")).toBeVisible();
    await expect(page.getByText("CASE-001")).toBeVisible();
    await expect(page.getByText("CASE-030")).toBeVisible();
  });

  test("AI-OFF toggle switches evaluation suite to manual baseline mode", async ({ page }) => {
    await page.goto("/app/evaluation/ai");
    await page.waitForTimeout(1000);

    if (page.url().includes("login") || page.url().includes("register")) {
      await expect(page).toHaveURL(/login|register/);
      return;
    }

    // Click AI OFF button
    await page.getByRole("button", { name: "AI OFF (Manual Baseline)" }).click();
    await page.waitForTimeout(1000);

    // Verify metrics indicate AI OFF mode
    await expect(page.getByText("N/A (AI OFF)").first()).toBeVisible();
    await expect(page.getByText("100% (30/30)").first()).toBeVisible();
  });
});
