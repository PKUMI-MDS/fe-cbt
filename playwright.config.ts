import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E Configuration
 *
 * - Base URL: http://localhost:3000 (dev server Next.js)
 * - Browser: Chromium saja (untuk kecepatan — bisa ditambah jika perlu)
 * - Timeout: 30 detik per test (lebih longgar untuk API calls)
 * - Reporter: html (buka dengan `npx playwright show-report`)
 *
 * Menjalankan tests:
 *   npm run test:e2e            — jalankan semua spec
 *   npm run test:e2e -- --ui    — buka Playwright UI mode
 *   npm run test:e2e -- auth    — hanya auth spec
 */

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : 2,
  timeout: 30_000,
  reporter: process.env.CI ? "dot" : "html",

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    // Viewport konsisten untuk semua test
    viewport: { width: 1280, height: 720 },
    // Lebih toleran dengan response time
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    // Uncomment untuk multi-browser testing:
    // {
    //   name: "firefox",
    //   use: { ...devices["Desktop Firefox"] },
    // },
    // {
    //   name: "mobile-chrome",
    //   use: { ...devices["Pixel 5"] },
    // },
  ],

  // Jalankan dev server otomatis jika belum running (opsional)
  // webServer: {
  //   command: "npm run dev",
  //   url: "http://localhost:3000",
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 60_000,
  // },
});
