import { test, expect } from "@playwright/test";
import { clearSession } from "./helpers";

/**
 * login.spec.ts — Smoke test cepat untuk halaman login.
 * Fokus: title, form fields visible, basic HTML5 validation.
 */

test.describe("Login Page — Smoke Tests", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test("halaman login punya title yang benar", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveTitle(/CAT\/CBT TOAFL/);
  });

  test("form login memiliki field email dan password", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("submit form kosong ditolak oleh browser (HTML5 required)", async ({ page }) => {
    await page.goto("/login");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/login/);
    await expect(page.locator('input[name="email"]')).toBeVisible();
  });

  test("halaman login dapat diakses tanpa auth", async ({ page }) => {
    await clearSession(page);
    await page.goto("/login");
    await page.waitForLoadState("networkidle").catch(() => {});
    // /login bukan protected — tidak redirect ke dashboard atau waiting
    await expect(page).not.toHaveURL(/dashboard|waiting/);
    await page.locator("form").waitFor({ state: "visible", timeout: 8_000 });
    await expect(page.locator("form")).toBeVisible();
  });
});
