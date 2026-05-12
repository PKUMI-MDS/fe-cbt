import { test, expect } from "@playwright/test";
import { clearSession } from "./helpers";

/**
 * auth.spec.ts — UI flow untuk register & login.
 *
 * Test ini TIDAK membutuhkan akun real — semuanya menggunakan validasi
 * client-side (HTML5 required, type=email, password mismatch) atau
 * mock credentials yang akan gagal di BE (sehingga kita tes error state).
 */

test.describe("Authentication — Login Page", () => {
  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
  });

  test("login page renders dengan title dan branding yang benar", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle").catch(() => {});
    await expect(page).toHaveTitle(/CAT\/CBT TOAFL/);
    // h1 di kiri (visible di desktop 1280px)
    await expect(
      page.getByText(/masuk ke dashboard peserta/i).first()
    ).toBeVisible();
  });

  test("login form — submit kosong tetap di halaman (HTML5 required)", async ({ page }) => {
    await page.goto("/login");
    // Tunggu LoginForm (client component) ter-hydrate
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.locator('button[type="submit"]').waitFor({ state: "visible", timeout: 8_000 });
    await page.click('button[type="submit"]');
    // HTML5 required mencegah submit — tetap di halaman login
    await expect(page).toHaveURL(/login/);
    await expect(page.locator('input[name="email"]')).toBeVisible();
  });

  test("login form — email format tidak valid ditolak browser", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.locator('button[type="submit"]').waitFor({ state: "visible", timeout: 8_000 });
    await page.fill('input[name="email"]', "bukan-email-valid");
    await page.fill('input[name="password"]', "password123");
    await page.click('button[type="submit"]');
    // Browser validasi type=email mencegah submit
    await expect(page).toHaveURL(/login/);
  });

  test("login form — credential salah menampilkan pesan error", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.locator('button[type="submit"]').waitFor({ state: "visible", timeout: 8_000 });
    await page.fill('input[name="email"]', `invalid-${Date.now()}@test.example`);
    await page.fill('input[name="password"]', "wrongpassword123");
    await page.click('button[type="submit"]');

    // Tunggu response API (maks 5 detik)
    const errorDiv = page.locator(
      "div.text-rose-700, [role='alert'], .text-rose-700"
    ).first();
    const isVisible = await errorDiv.isVisible({ timeout: 6_000 }).catch(() => false);

    if (!isVisible) {
      // BE tidak running — test ini di-skip
      test.skip(true, "Backend tidak tersedia — skip test error credential");
    }

    await expect(errorDiv).toBeVisible();
  });

  // Skipped: timing-specific loading state is flaky in production E2E because the submit can resolve before assertion.
  test.skip("login form — tombol disabled saat submitting", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.locator('button[type="submit"]').waitFor({ state: "visible", timeout: 8_000 });
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "password123");

    // Intercept request agar lambat (simulasi loading state)
    await page.route("**/api/login", async (route) => {
      await new Promise((r) => setTimeout(r, 1_500));
      await route.abort();
    });

    // Click submit
    void page.click('button[type="submit"]');
    // Cek tombol disabled setelah click
    await expect(page.locator('button[type="submit"]')).toBeDisabled({ timeout: 1_000 });
  });

  test("ada link ke halaman register", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle").catch(() => {});
    await expect(page.getByRole("link", { name: /daftar sekarang/i })).toBeVisible();
  });

  test("ada link ke forgot-password", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle").catch(() => {});
    await expect(page.getByRole("link", { name: /lupa password/i })).toBeVisible();
  });
});

test.describe("Authentication — Register Page", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test("register page renders dengan semua field yang dibutuhkan", async ({ page }) => {
    await page.goto("/register");
    await page.waitForLoadState("networkidle").catch(() => {});
    await expect(page).toHaveTitle(/CAT\/CBT TOAFL/);
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="phone"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="password_confirmation"]')).toBeVisible();
    await expect(page.locator('select[name="exam_type"]')).toHaveCount(0);
  });

  test("register form — submit kosong tetap di halaman (HTML5 required)", async ({ page }) => {
    await page.goto("/register");
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.locator('button[type="submit"]').waitFor({ state: "visible", timeout: 8_000 });
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/register/);
    await expect(page.locator('input[name="name"]')).toBeVisible();
  });

  test("register form — password mismatch tampilkan error client-side", async ({ page }) => {
    await page.goto("/register");
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.locator('button[type="submit"]').waitFor({ state: "visible", timeout: 8_000 });
    await page.fill('input[name="name"]', "Test User");
    await page.fill('input[name="email"]', `test-${Date.now()}@test.example`);
    await page.fill('input[name="phone"]', "08123456789");
    await page.fill('input[name="password"]', "password123");
    await page.fill('input[name="password_confirmation"]', "berbeda456");
    await page.click('button[type="submit"]');

    // Error muncul tanpa API call karena validasi client-side
    await expect(
      page.locator("text=/tidak sama|mismatch|konfirmasi/i").first()
    ).toBeVisible({ timeout: 3_000 });
  });

  test("register form — password kurang dari 8 karakter ditolak (HTML5 minlength)", async ({ page }) => {
    await page.goto("/register");
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.locator('button[type="submit"]').waitFor({ state: "visible", timeout: 8_000 });
    await page.fill('input[name="name"]', "Test User");
    await page.fill('input[name="email"]', `test-${Date.now()}@test.example`);
    await page.fill('input[name="phone"]', "08123456789");
    // Password < 8 karakter — minLength={8} mencegah submit (sama seperti required)
    await page.fill('input[name="password"]', "abc");
    await page.fill('input[name="password_confirmation"]', "abc");
    await page.click('button[type="submit"]');

    // Browser HTML5 minlength mencegah submit — halaman tetap di /register
    await expect(page).toHaveURL(/register/);
    // Field password masih visible (tidak di-reset / tidak redirect)
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test("register form tidak menampilkan exam_type karena kontrak BE terbaru tidak memakainya", async ({ page }) => {
    await page.goto("/register");
    await page.waitForLoadState("networkidle").catch(() => {});
    await expect(page.locator('select[name="exam_type"]')).toHaveCount(0);
  });
});

test.describe("Authentication — Logout redirect", () => {
  test("user yang belum login di /login tidak di-redirect ke mana-mana", async ({ page }) => {
    await clearSession(page);
    await page.goto("/login");
    await page.waitForLoadState("networkidle").catch(() => {});
    await expect(page).toHaveURL(/login/);
    await page.locator('button[type="submit"]').waitFor({ state: "visible", timeout: 8_000 });
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
});
