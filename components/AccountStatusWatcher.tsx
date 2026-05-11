"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { CheckCircle, XCircle, Info, X } from "lucide-react";
import { getCurrentUser } from "@/lib/auth-api";
import { getAuthToken } from "@/lib/auth";
import type { AuthUser } from "@/lib/types";

/** Halaman yang dikecualikan dari polling (exam engine — jangan ganggu saat ujian) */
const EXCLUDED_PATHS = ["/exam"];

/** Interval polling dalam ms */
const POLL_INTERVAL_MS = 30_000;

type BannerVariant = "success" | "error" | "info";

interface StatusBannerProps {
  message: string;
  variant: BannerVariant;
  countdown?: number;
  onDismiss: () => void;
}

function StatusBanner({ message, variant, countdown, onDismiss }: StatusBannerProps) {
  const base =
    "fixed top-4 left-1/2 z-[100] -translate-x-1/2 flex items-center gap-3 rounded-2xl px-5 py-3.5 shadow-lg text-sm font-semibold max-w-[calc(100vw-2rem)] transition-all duration-300 animate-fade-in-up";

  const variants: Record<BannerVariant, string> = {
    success: `${base} bg-emerald-600 text-white`,
    error: `${base} bg-rose-600 text-white`,
    info: `${base} bg-slate-900 text-white`,
  };

  const Icon =
    variant === "success" ? CheckCircle : variant === "error" ? XCircle : Info;

  return (
    <div role="status" aria-live="polite" className={variants[variant]}>
      <Icon className="h-4 w-4 shrink-0" />
      <span>
        {message}
        {countdown !== undefined && countdown > 0 && (
          <> &mdash; Dashboard dalam <strong>{countdown}s</strong></>
        )}
      </span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Tutup notifikasi"
        className="ml-2 rounded-full p-0.5 opacity-70 hover:opacity-100 focus:outline-none"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/**
 * AccountStatusWatcher — mount sekali di root layout (di dalam Providers).
 *
 * Responsibilities:
 * 1. Polling GET /api/me setiap 30 detik jika user login & akun belum active.
 * 2. Deteksi perubahan status (pending → active / rejected) dan tampilkan banner.
 * 3. Auto-redirect ke /dashboard 5 detik setelah status berubah ke active.
 * 4. Tidak polling di halaman exam (anti-cheat — jangan ada request tak terduga).
 */
export default function AccountStatusWatcher() {
  const router = useRouter();
  const pathname = usePathname();

  const [banner, setBanner] = useState<{
    message: string;
    variant: BannerVariant;
    showCountdown: boolean;
  } | null>(null);
  const [countdown, setCountdown] = useState(0);

  const previousStatusRef = useRef<string | null>(null);
  const currentUserRef = useRef<AuthUser | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isExamPage = EXCLUDED_PATHS.some((p) => pathname.startsWith(p));

  const dismissBanner = useCallback(() => {
    setBanner(null);
    setCountdown(0);
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  /** Mulai countdown 5 detik lalu redirect ke dashboard */
  const startRedirectCountdown = useCallback(() => {
    setCountdown(5);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          countdownRef.current = null;
          router.push("/dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [router]);

  /** Satu siklus poll */
  const poll = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const user = await getCurrentUser();
      currentUserRef.current = user;
      const newStatus = user.account_status;
      const oldStatus = previousStatusRef.current;

      // Pertama kali — simpan status awal, jangan notifikasi
      if (oldStatus === null) {
        previousStatusRef.current = newStatus;
        return;
      }

      // Tidak berubah — skip
      if (newStatus === oldStatus) return;

      previousStatusRef.current = newStatus;

      if (newStatus === "active") {
        setBanner({
          message: "🎉 Akun Anda telah disetujui! Selamat datang.",
          variant: "success",
          showCountdown: true,
        });
        startRedirectCountdown();
      } else if (newStatus === "rejected") {
        setBanner({
          message: "⚠️ Akun Anda ditolak oleh admin. Hubungi admin untuk info lebih lanjut.",
          variant: "error",
          showCountdown: false,
        });
      } else if (newStatus === "suspended") {
        setBanner({
          message: "🚫 Akun Anda ditangguhkan. Silakan hubungi admin.",
          variant: "error",
          showCountdown: false,
        });
      }
    } catch {
      // Abaikan error polling — jangan ganggu UX
    }
  }, [startRedirectCountdown]);

  /** Setup / teardown polling */
  useEffect(() => {
    if (isExamPage) {
      // Hentikan polling saat exam
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      return;
    }

    const token = getAuthToken();
    if (!token) return;

    // Poll sekali langsung, lalu interval
    void poll();
    pollingRef.current = setInterval(() => void poll(), POLL_INTERVAL_MS);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [isExamPage, poll]);

  // Reset previousStatus saat token hilang (logout)
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      previousStatusRef.current = null;
    }
  }, [pathname]);

  // Cleanup countdown on unmount
  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  if (!banner) return null;

  return (
    <StatusBanner
      message={banner.message}
      variant={banner.variant}
      countdown={banner.showCountdown ? countdown : undefined}
      onDismiss={dismissBanner}
    />
  );
}
