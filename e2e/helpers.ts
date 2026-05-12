import { test, expect } from "@playwright/test";

/**
 * helpers.ts — Shared utilities untuk semua e2e spec.
 *
 * loginAsParticipant: Login dengan credential real (via UI).
 * Gunakan ini hanya jika BE sedang running dan ada test account.
 * Untuk test yang tidak butuh auth, cukup langsung goto().
 */

import type { Page } from "@playwright/test";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

/** Bersihkan localStorage & cookie (simulasi logout penuh) */
export async function clearSession(page: Page) {
  // Clear cookies dulu (bisa di state apa pun)
  await page.context().clearCookies();
  // Navigate ke root agar localStorage bisa diakses (tidak SecurityError di about:blank)
  const currentUrl = page.url();
  if (!currentUrl.startsWith(BASE_URL)) {
    await page.goto("/", { waitUntil: "domcontentloaded" });
  }
  await page.evaluate(() => {
    try { window.localStorage.clear(); } catch { /* ignore */ }
  });
}

/**
 * Login via UI. Pastikan BE running dan credential valid.
 * Setelah dipanggil, page akan di-redirect ke /dashboard atau /waiting-approval.
 */
export async function loginAsParticipant(
  page: Page,
  email: string,
  password: string
) {
  await clearSession(page);
  await page.goto("/login");
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  // Tunggu redirect (dashboard atau waiting-approval)
  await page.waitForURL(/dashboard|waiting-approval/, { timeout: 10_000 });
}

/**
 * Inject token langsung ke localStorage & cookie tanpa UI login.
 * Gunakan ini untuk test yang butuh state auth tapi tidak perlu test UI login.
 */
export async function injectAuthToken(page: Page, token: string) {
  await page.goto("/");
  await page.evaluate((t) => {
    window.localStorage.setItem("cbt_participant_token", t);
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `cbt_participant_token=${encodeURIComponent(t)}; expires=${expires}; path=/; SameSite=Lax`;
  }, token);
}

/** Tunggu networkidle dengan timeout yang lebih pendek */
export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {
    // networkidle bisa timeout jika ada polling — tidak apa
  });
}
