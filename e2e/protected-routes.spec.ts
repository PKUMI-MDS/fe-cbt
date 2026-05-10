import { test, expect } from "@playwright/test";

test.describe("Protected Routes & Middleware", () => {
  test("unauthenticated user redirected from dashboard to login", async ({
    page,
    context,
  }) => {
    // Clear any existing cookies
    await context.clearCookies();
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/login/);
  });

  test("unauthenticated user redirected from profile to login", async ({
    page,
    context,
  }) => {
    await context.clearCookies();
    await page.goto("/profile");
    await expect(page).toHaveURL(/login/);
  });

  test("unauthenticated user redirected from payment-proof to login", async ({
    page,
    context,
  }) => {
    await context.clearCookies();
    await page.goto("/payment-proof");
    await expect(page).toHaveURL(/login/);
  });

  test("public pages accessible without auth", async ({ page }) => {
    await page.goto("/panduan");
    await expect(page).not.toHaveURL(/login/);

    await page.goto("/forgot-password");
    await expect(page).not.toHaveURL(/login/);
  });

  test("login page accessible when unauthenticated", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
});
