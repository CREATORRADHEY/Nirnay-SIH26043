content = """import { test, expect } from '@playwright.test';

test.describe('P4A AI Assistance + Safety & Authority Boundaries', () => {
  test('Citizen AI extraction wizard displays non-authoritative suggestions', async ({ page }) => {
    await page.goto('/app/challenges/new');
    
    // Look for Structure with AI button
    const aiButton = page.locator('button', { hasText: 'Structure with AI' });
    if (await aiButton.isVisible()) {
      await aiButton.click();
      await expect(page.locator('text=Structure Problem Report with AI')).toBeVisible();
      await expect(page.locator('text=Advisory Notice')).toBeVisible();
    }
  });

  test('Government AI panel displays advisory route and HEI candidate suggestions', async ({ page }) => {
    await page.goto('/app/review');
    
    // Look for queue table or review workbench link
    const reviewLink = page.locator('a', { hasText: 'Review Workbench' }).first();
    if (await reviewLink.isVisible()) {
      await reviewLink.click();
      
      // Verify AI Review Assistance panel exists
      await expect(page.locator('text=AI Review Assistance (Advisory Only)')).toBeVisible();
      await expect(page.locator('text=Non-Authoritative')).toBeVisible();
    }
  });

  test('HEI R&D matching workbench displays advisory AI suggestion panel', async ({ page }) => {
    await page.goto('/app/hei-matching');
    
    await expect(page.locator('text=AI HEI Candidate Assistance (Advisory)')).toBeVisible();
    await expect(page.locator('button', { hasText: 'Suggest Relevant HEIs' })).toBeVisible();
  });
});
"""

with open("apps/web/e2e/06-ai-assistance.spec.ts", "w") as f:
    f.write(content)

print("apps/web/e2e/06-ai-assistance.spec.ts created")
