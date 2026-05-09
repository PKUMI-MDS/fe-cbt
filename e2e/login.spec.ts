import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/login');
  await expect(page).toHaveTitle(/CAT\/CBT TOAFL/);
});

test('login flow validation', async ({ page }) => {
  await page.goto('/login');
  
  // Try to submit empty form
  await page.click('button[type="submit"]');
  
  // Expect validation error
  await expect(page.getByText('Email harus diisi')).toBeVisible();
});
