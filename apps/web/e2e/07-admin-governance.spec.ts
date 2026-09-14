import { test, expect } from '@playwright/test';

/**
 * P4B Platform Admin & Governance E2E
 */
test.describe('P4B Platform Admin & Governance', () => {
  test.setTimeout(20_000);

  test('Unauthenticated access to /app/admin redirects to login', async ({ page }) => {
    await page.goto('/app/admin');
    await page.waitForURL(/login|register/, { timeout: 12_000 });
    await expect(page).toHaveURL(/login|register/);
  });

  test('Unauthenticated access to /app/admin/organizations redirects to login', async ({ page }) => {
    await page.goto('/app/admin/organizations');
    await page.waitForURL(/login|register/, { timeout: 12_000 });
    await expect(page).toHaveURL(/login|register/);
  });

  test('Unauthenticated access to /app/admin/users redirects to login', async ({ page }) => {
    await page.goto('/app/admin/users');
    await page.waitForURL(/login|register/, { timeout: 12_000 });
    await expect(page).toHaveURL(/login|register/);
  });

  test('Unauthenticated access to /app/admin/audit redirects to login', async ({ page }) => {
    await page.goto('/app/admin/audit');
    await page.waitForURL(/login|register/, { timeout: 12_000 });
    await expect(page).toHaveURL(/login|register/);
  });

  test('Unauthenticated access to /app/admin/ai redirects to login', async ({ page }) => {
    await page.goto('/app/admin/ai');
    await page.waitForURL(/login|register/, { timeout: 12_000 });
    await expect(page).toHaveURL(/login|register/);
  });
});
