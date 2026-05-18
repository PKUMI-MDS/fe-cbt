/**
 * Deteksi device mobile/tablet berdasarkan user agent + screen size + touch.
 * Ujian CBT hanya diperbolehkan di laptop/desktop.
 */

export function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;

  // 1. User Agent check
  const userAgent = navigator.userAgent.toLowerCase();
  const mobileKeywords = [
    "android",
    "webos",
    "iphone",
    "ipad",
    "ipod",
    "blackberry",
    "windows phone",
    "iemobile",
    "opera mini",
    "mobile",
    "tablet",
  ];
  const isMobileUA = mobileKeywords.some((kw) => userAgent.includes(kw));

  // 2. Screen size check (mobile/tablet biasanya < 1024px lebar)
  const isSmallScreen = window.innerWidth < 1024;

  // 3. Touch device check (tablet/hp punya maxTouchPoints > 0)
  const isTouchDevice = "maxTouchPoints" in navigator && navigator.maxTouchPoints > 1;

  // 4. Orientation check (hp biasanya portrait dengan rasio tinggi)
  const isPortraitPhone = window.innerHeight / window.innerWidth > 1.5 && window.innerWidth < 768;

  // Dianggap mobile kalau UA mobile ATAU (layar kecil DAN touch device) ATAU portrait phone
  return isMobileUA || (isSmallScreen && isTouchDevice) || isPortraitPhone;
}

export function getDeviceType(): "desktop" | "tablet" | "mobile" {
  if (typeof window === "undefined") return "desktop";

  const userAgent = navigator.userAgent.toLowerCase();
  const isTabletUA = /ipad|android(?!.*mobile)|tablet/.test(userAgent);
  const isMobileUA = /iphone|ipod|android.*mobile|windows phone|webos|blackberry|opera mini|iemobile/.test(userAgent);

  if (isTabletUA) return "tablet";
  if (isMobileUA) return "mobile";

  const isTouch = navigator.maxTouchPoints > 1;
  const isSmall = window.innerWidth < 768;
  const isMedium = window.innerWidth >= 768 && window.innerWidth < 1024;

  if (isTouch && isSmall) return "mobile";
  if (isTouch && isMedium) return "tablet";

  return "desktop";
}
