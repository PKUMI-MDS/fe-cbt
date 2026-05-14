"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle, Hourglass, RefreshCw } from "lucide-react";
import { useAuthSession } from "@/lib/use-auth-session";
import Toast from "@/components/Toast";

function statusLabel(status?: string) {
  const labels: Record<string, string> = {
    pending_verification: "Pending",
    rejected: "Ditolak",
    suspended: "Ditangguhkan",
    active: "Aktif",
  };

  return status ? labels[status] ?? status : "Belum login";
}

export default function WaitingApprovalStatus() {
  const router = useRouter();
  const { status, user, refresh } = useAuthSession();
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState("");
  const [countdown, setCountdown] = useState(0);
  const previousStatusRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setMessage(params.get("message") ?? "");
  }, []);

  // Track initial status to detect transition
  useEffect(() => {
    if (user?.account_status && !previousStatusRef.current) {
      previousStatusRef.current = user.account_status;
    }
  }, [user?.account_status]);

  // Polling otomatis setiap 30 detik selama akun belum aktif
  useEffect(() => {
    if (user?.account_status === "active") return;
    if (status === "unauthenticated") return;

    const interval = setInterval(() => {
      void refresh();
    }, 30_000);

    return () => clearInterval(interval);
  }, [refresh, status, user?.account_status]);

  // Detect status change from pending → active
  useEffect(() => {
    const currentStatus = user?.account_status;
    const previousStatus = previousStatusRef.current;

    if (
      previousStatus &&
      previousStatus !== "active" &&
      currentStatus === "active"
    ) {
      setToast("🎉 Selamat! Akun Anda telah disetujui admin.");
      setCountdown(5);
    }

    if (currentStatus) {
      previousStatusRef.current = currentStatus;
    }
  }, [user?.account_status]);

  // Auto-redirect countdown
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, router]);

  const isActive = user?.account_status === "active";
  const isRejected = user?.account_status === "rejected";

  return (
    <div className="status-panel border border-amber-200">
      <Toast message={toast} onHide={() => setToast("")} />

      {isActive ? (
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 animate-fade-in-up">
          <CheckCircle className="h-10 w-10 text-emerald-600" />
        </div>
      ) : (
        <Hourglass className="mx-auto h-16 w-16 text-amber-600" />
      )}

      <h1>
        {isActive
          ? countdown > 0
            ? "Akun Sudah Aktif!"
            : "Akun Sudah Aktif"
          : isRejected
          ? "Akun Ditolak"
          : "Menunggu Verifikasi Admin"}
      </h1>

      <p>
        {message ||
          (isActive
            ? countdown > 0
              ? `Anda akan diarahkan ke dashboard dalam ${countdown} detik...`
              : "Akun Anda telah aktif. Silakan masuk ke dashboard untuk mengakses ujian."
            : isRejected
            ? "Maaf, akun Anda ditolak oleh admin. Silakan hubungi admin untuk informasi lebih lanjut."
            : status === "authenticated"
            ? "Status akun dibaca dari backend. Refresh status jika admin baru saja melakukan verifikasi."
            : "Registrasi berhasil dikirim. Akun belum bisa mengakses ujian sampai proses verifikasi admin selesai.")}
      </p>

      <div className="status-grid">
        <div>
          <small>Status Akun</small>
          <strong
            className={
              isActive
                ? "text-emerald-700"
                : isRejected
                ? "text-rose-700"
                : "text-amber-700"
            }
          >
            {status === "loading" ? "Memeriksa..." : statusLabel(user?.account_status)}
          </strong>
        </div>
        <div>
          <small>Email</small>
          <strong>{user?.email ?? "-"}</strong>
        </div>
        <div>
          <small>Bukti Bayar</small>
          <Link
            href="/payment-proof"
            className="inline-flex items-center gap-1 font-bold text-brand-600 hover:text-brand-700 hover:underline transition"
          >
            Upload / Cek Status
          </Link>
        </div>
      </div>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        {status === "authenticated" && !isActive ? (
          <button
            type="button"
            onClick={() => void refresh()}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Status
          </button>
        ) : null}

        {isActive ? (
          <Link href="/dashboard" className="btn-primary inline-flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Ke Dashboard Sekarang
          </Link>
        ) : (
          <Link
            href={isActive ? "/dashboard" : "/login"}
            className={isRejected ? "btn-secondary" : "btn-primary"}
          >
            {isRejected ? "Kembali ke Login" : "Kembali ke Login"}
          </Link>
        )}
      </div>
    </div>
  );
}
