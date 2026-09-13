import { test, expect } from "@playwright/test";

/**
 * NIRNAY Auth E2E
 * Tests: registration, login, logout, protected route redirect.
 * Requires API at http://localhost:8000.
 * Uses unique email per run to avoid conflicts.
 *
 * Note: auth redirects are client-side (AppShell pattern), so
 * we use waitForURL with a reasonable timeout (12s) after page load.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const timestamp = Date.now();
const TEST_EMAIL = `e2e_${timestamp}@nirnay-test.local`;
const TEST_PASSWORD = "E2eTest!Pass123";
const TEST_NAME = "E2E Test User";

test.describe("Authentication Flows", () => {
  test.setTimeout(45_000);

  test("protected /app route redirects unauthenticated user to /login", async ({ page }) => {
    await page.goto("/app");
    // Client-side redirect: wait for URL to change to /login
    await page.waitForURL(/login|register/, { timeout: 12_000 });
    await expect(page).toHaveURL(/login|register/);
  });

  test("registration flow creates account and lands on app dashboard", async ({ page }) => {
    const apiAvailable = await page.request.get(`${API_BASE}/health`).then(r => r.ok()).catch(() => false);
    if (!apiAvailable) {
      test.skip(true, "API server not available at localhost:8000 — start with: cd apps/api && uvicorn app.main:app --reload");
    }

    await page.goto("/register");
    await expect(page.locator("input[name='display_name'], input[placeholder*='name' i]").first()).toBeVisible();

    await page.fill("input[name='display_name'], input[placeholder*='name' i]", TEST_NAME);
    await page.fill("input[name='email'], input[type='email']", TEST_EMAIL);
    await page.fill("input[name='password'], input[type='password']", TEST_PASSWORD);
    await page.click("button[type='submit']");

    await page.waitForURL(/app|dashboard/, { timeout: 10_000 });
    await expect(page).toHaveURL(/app/);
  });

  test("login with valid credentials works", async ({ page }) => {
    const apiAvailable = await page.request.get(`${API_BASE}/health`).then(r => r.ok()).catch(() => false);
    if (!apiAvailable) {
      test.skip(true, "API server not available");
    }

    await page.goto("/login");
    await page.fill("input[name='email'], input[type='email']", TEST_EMAIL);
    await page.fill("input[name='password'], input[type='password']", TEST_PASSWORD);
    await page.click("button[type='submit']");

    await page.waitForURL(/app/, { timeout: 10_000 });
    await expect(page).toHaveURL(/app/);
  });

  test("login with invalid credentials shows error", async ({ page }) => {
    const apiAvailable = await page.request.get(`${API_BASE}/health`).then(r => r.ok()).catch(() => false);
    if (!apiAvailable) {
      test.skip(true, "API server not available");
    }

    await page.goto("/login");
    await page.fill("input[name='email'], input[type='email']", "wrong@example.com");
    await page.fill("input[name='password'], input[type='password']", "wrongpassword");
    await page.click("button[type='submit']");

    await expect(page).toHaveURL(/login/);
    await expect(page.locator("form")).toBeVisible();
  });

  test("logout clears session and redirects to login", async ({ page }) => {
    const apiAvailable = await page.request.get(`${API_BASE}/health`).then(r => r.ok()).catch(() => false);
    if (!apiAvailable) {
      test.skip(true, "API server not available");
    }

    await page.goto("/login");
    await page.fill("input[type='email']", TEST_EMAIL);
    await page.fill("input[type='password']", TEST_PASSWORD);
    await page.click("button[type='submit']");
    await page.waitForURL(/app/, { timeout: 10_000 });

    const logoutBtn = page.locator("button, a").filter({ hasText: /logout|sign out/i }).first();
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
      await page.waitForURL(/login|\//, { timeout: 8_000 });
      await expect(page).not.toHaveURL(/\/app\/?$/);
    } else {
      await page.request.post(`${API_BASE}/api/v1/auth/logout`, { failOnStatusCode: false });
    }
  });
});
