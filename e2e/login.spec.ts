import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/login');
  await expect(page).toHaveTitle(/CAT\/CBT TOAFL/);
});

test('login form prevents empty submit via HTML5 validation', async ({ page }) => {
  await page.goto('/login');
  
  // Try to submit empty form — browser required attribute prevents it
  await page.click('button[type="submit"]');
  
  // Should still be on login page
  await expect(page).toHaveURL(/login/);
  await expect(page.locator('input[name="email"]')).toBeVisible();
});
