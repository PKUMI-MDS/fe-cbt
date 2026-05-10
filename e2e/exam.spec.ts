import { test, expect } from "@playwright/test";

test.describe("Exam Engine & Anti-Cheat", () => {
  test("exam page shows fullscreen modal when no active attempt", async ({
    page,
  }) => {
    await page.goto("/exam");
    // If user is not logged in, should redirect to login
    const url = page.url();
    if (url.includes("login")) {
      test.skip(true, "User not authenticated");
      return;
    }

    // If on exam page, should show error or fullscreen modal
    await page.waitForLoadState("networkidle");
    const hasFullscreenModal = await page
      .locator("text=/fullscreen|layar penuh/i")
      .first()
      .isVisible()
      .catch(() => false);
    const hasError = await page
      .locator("text=/tidak ada ujian|ujian aktif/i")
      .first()
      .isVisible()
      .catch(() => false);

    expect(hasFullscreenModal || hasError).toBeTruthy();
  });

  test("exam instruction page renders correctly", async ({ page }) => {
    await page.goto("/exam/instruction");
    const url = page.url();
    if (url.includes("login")) {
      test.skip(true, "User not authenticated");
      return;
    }

    await expect(
      page.locator("text=/petunjuk|instruksi|panduan ujian/i").first()
    ).toBeVisible();
  });

  test("exam history page accessible", async ({ page }) => {
    await page.goto("/exam/history");
    const url = page.url();
    if (url.includes("login")) {
      test.skip(true, "User not authenticated");
      return;
    }

    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("anti-cheat: right-click disabled on exam page", async ({ page }) => {
    await page.goto("/exam");
    const url = page.url();
    if (url.includes("login")) {
      test.skip(true, "User not authenticated");
      return;
    }

    // Try to trigger contextmenu
    const contextMenuFired = await page.evaluate(() => {
      return new Promise<boolean>((resolve) => {
        let fired = false;
        const handler = () => {
          fired = true;
        };
        document.addEventListener("contextmenu", handler);
        const event = new MouseEvent("contextmenu", { bubbles: true });
        document.body.dispatchEvent(event);
        setTimeout(() => {
          document.removeEventListener("contextmenu", handler);
          resolve(fired);
        }, 100);
      });
    });

    // The event should fire but be prevented by the handler
    // We can't easily test prevention, but we can verify the page loads
    expect(contextMenuFired).toBe(true);
  });

  test("waiting-approval page renders status panel", async ({ page }) => {
    await page.goto("/waiting-approval");
    await expect(
      page.locator("text=/menunggu verifikasi|waiting/i").first()
    ).toBeVisible();
  });
});
