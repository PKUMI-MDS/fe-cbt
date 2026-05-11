import { test, expect } from "@playwright/test";

/**
 * protected-routes.spec.ts — Verifikasi middleware server-side.
 *
 * PUBLIC_PATHS di middleware.ts:
 *   /, /login, /register, /forgot-password, /waiting-approval, /panduan
 *
 * Protected routes (require token cookie) adalah semua path LAIN:
 *   /dashboard, /profile, /payment-proof, /exam/*, /exam/history, dll.
 *
 * NOTE: /waiting-approval adalah PUBLIC karena user post-register
 * belum punya token tapi butuh lihat status akunnya.
 */

test.describe("Protected Routes — Server Middleware Redirect", () => {
  // Routes yang PASTI redirect ke login jika tidak ada token cookie
  const PROTECTED_ROUTES = [
    "/dashboard",
    "/profile",
    "/payment-proof",
    "/exam/history",
  ];

  for (const route of PROTECTED_ROUTES) {
    test(`${route} → redirect ke /login jika tidak ada token`, async ({
      page,
      context,
    }) => {
      await context.clearCookies();
      await page.goto(route);
      await page.waitForURL(/login/, { timeout: 6_000 });
      await expect(page).toHaveURL(/login/);
    });
  }
});

test.describe("Public Routes — Accessible Tanpa Auth", () => {
  // Berdasarkan PUBLIC_PATHS di middleware.ts
  const PUBLIC_ROUTES = [
    "/",
    "/register",
    "/panduan",
    "/forgot-password",
    "/waiting-approval",
  ];

  for (const route of PUBLIC_ROUTES) {
    test(`${route} — dapat diakses tanpa token`, async ({ page, context }) => {
      await context.clearCookies();
      await page.goto(route);
      // Tunggu halaman load
      await page.waitForLoadState("networkidle").catch(() => {});
      // Tidak boleh di-redirect ke login
      await expect(page).not.toHaveURL(/login/);
    });
  }
});

test.describe("Auth Redirect — User Sudah Login", () => {
  test("halaman /login punya form submit visible", async ({ page, context }) => {
    await context.clearCookies();
    await page.goto("/login");
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.locator('button[type="submit"]').waitFor({ state: "visible", timeout: 8_000 });
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("halaman /register punya form visible", async ({ page, context }) => {
    await context.clearCookies();
    await page.goto("/register");
    await page.waitForLoadState("networkidle").catch(() => {});
    await expect(page.locator("form")).toBeVisible();
  });

  test("halaman /panduan dapat diakses dan ada konten", async ({ page, context }) => {
    await context.clearCookies();
    await page.goto("/panduan");
    await page.waitForLoadState("networkidle").catch(() => {});
    await expect(page).not.toHaveURL(/login/);
    await expect(page.locator("body")).not.toBeEmpty();
  });

  test("halaman /waiting-approval dapat diakses (public) dan ada konten", async ({ page, context }) => {
    await context.clearCookies();
    await page.goto("/waiting-approval");
    await page.waitForLoadState("networkidle").catch(() => {});
    // waiting-approval adalah public path — tidak redirect ke login
    await expect(page).not.toHaveURL(/^http:\/\/localhost:3000\/login/);
    await expect(page.locator("body")).not.toBeEmpty();
  });
});
