import { Page } from "@playwright/test";

export async function loginUser(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL("/dashboard", { timeout: 10000 });
}

export async function logoutUser(page: Page) {
  await page.goto("/dashboard");
  await page.click('a[href="/logout"], button:has-text("Logout")');
  await page.waitForURL("/login", { timeout: 10000 });
}
