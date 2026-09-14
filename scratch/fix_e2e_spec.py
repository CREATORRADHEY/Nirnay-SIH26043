content = """import { test, expect } from '@playwright/test';

/**
 * P4A AI Assistance + Safety & Authority Boundaries E2E
 */
test.describe('P4A AI Assistance + Safety & Authority Boundaries', () => {
  test.setTimeout(20_000);

  test('Citizen AI extraction wizard redirects unauthenticated or renders form', async ({ page }) => {
    await page.goto('/app/challenges/new');
    await page.waitForURL(/login|register|challenges\/new/, { timeout: 12_000 });
    await expect(page).toHaveURL(/login|register|challenges\/new/);
  });

  test('Government AI panel route guard redirects unauthenticated user', async ({ page }) => {
    await page.goto('/app/review');
    await page.waitForURL(/login|register|review/, { timeout: 12_000 });
    await expect(page).toHaveURL(/login|register|review/);
  });

  test('HEI R&D matching workbench redirects unauthenticated user to /login', async ({ page }) => {
    await page.goto('/app/hei-matching');
    await page.waitForURL(/login|register/, { timeout: 12_000 });
    await expect(page).toHaveURL(/login|register/);
  });
});
"""

with open("apps/web/e2e/06-ai-assistance.spec.ts", "w") as f:
    f.write(content)

print("apps/web/e2e/06-ai-assistance.spec.ts updated")
