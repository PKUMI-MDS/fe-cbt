"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Hourglass } from "lucide-react";
import { useAuthSession } from "@/lib/use-auth-session";

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
  const { status, user, refresh } = useAuthSession();
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setMessage(params.get("message") ?? "");
  }, []);

  // Polling otomatis setiap 30 detik selama akun belum aktif
  useEffect(() => {
    if (user?.account_status === "active") return;
    if (status === "unauthenticated") return;

    const interval = setInterval(() => {
      void refresh();
    }, 30_000);

    return () => clearInterval(interval);
  }, [refresh, status, user?.account_status]);

  const isActive = user?.account_status === "active";

  return (
    <div className="status-panel border border-amber-200">
      <Hourglass className="mx-auto h-16 w-16 text-amber-600" />
      <h1>{isActive ? "Akun Sudah Aktif" : "Menunggu Verifikasi Admin"}</h1>
      <p>
        {message ||
          (status === "authenticated"
            ? "Status akun dibaca dari backend. Refresh status jika admin baru saja melakukan verifikasi."
            : "Registrasi berhasil dikirim. Akun belum bisa mengakses ujian sampai proses verifikasi admin selesai.")}
      </p>
      <div className="status-grid">
        <div>
          <small>Status Akun</small>
          <strong className={isActive ? "text-emerald-700" : "text-amber-700"}>
            {status === "loading" ? "Memeriksa..." : statusLabel(user?.account_status)}
          </strong>
        </div>
        <div>
          <small>Email</small>
          <strong>{user?.email ?? "-"}</strong>
        </div>
        <div>
          <small>Bukti Bayar</small>
          <strong className="text-slate-500">Cek di menu pembayaran</strong>
        </div>
      </div>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        {status === "authenticated" ? (
          <button type="button" onClick={() => void refresh()} className="btn-secondary">
            Refresh Status
          </button>
        ) : (
          <Link href="/register" className="btn-secondary">
            Daftar Akun
          </Link>
        )}
        <Link href={isActive ? "/dashboard" : "/login"} className="btn-primary">
          {isActive ? "Ke Dashboard" : "Kembali ke Login"}
        </Link>
      </div>
    </div>
  );
}
