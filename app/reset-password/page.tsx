"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { resetPassword } from "@/lib/auth-api";
import { Lock, ArrowLeft, CheckCircle } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }

    if (password !== passwordConfirmation) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword({ email, token, password, password_confirmation: passwordConfirmation });
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal reset password. Token mungkin sudah kedaluwarsa.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!email || !token) {
    return (
      <div className="panel w-full text-center">
        <h1 className="text-2xl font-extrabold text-slate-950">Link Tidak Valid</h1>
        <p className="mt-2 text-sm text-slate-500">
          Link reset password tidak lengkap. Pastikan Anda membuka link dari email dengan benar.
        </p>
        <Link href="/forgot-password" className="btn-primary mt-6 inline-flex">
          Minta Token Baru
        </Link>
      </div>
    );
  }

  return (
    <div className="panel w-full">
      {isSuccess ? (
        <div className="text-center">
          <CheckCircle className="mx-auto h-10 w-10 text-emerald-600" />
          <h1 className="mt-4 text-2xl font-extrabold text-slate-950">Password Berhasil Diubah</h1>
          <p className="mt-2 text-sm text-slate-500">
            Password Anda telah berhasil direset. Silakan login dengan password baru.
          </p>
          <Link href="/login" className="btn-primary mt-6 inline-flex">
            Login Sekarang
          </Link>
        </div>
      ) : (
        <>
          <Lock className="h-10 w-10 text-brand-600" />
          <h1 className="mt-2 text-2xl font-extrabold text-slate-950">Reset Password</h1>
          <p className="mt-2 text-sm text-slate-500">
            Buat password baru untuk akun <strong>{email}</strong>.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                Password Baru
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field w-full mt-1"
                placeholder="Min. 8 karakter"
              />
            </div>

            <div>
              <label htmlFor="password_confirmation" className="block text-sm font-semibold text-slate-700">
                Konfirmasi Password
              </label>
              <input
                id="password_confirmation"
                type="password"
                required
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                className="field w-full mt-1"
                placeholder="Ulangi password"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {isLoading ? "Memproses..." : "Reset Password"}
            </button>
          </form>

          <Link
            href="/login"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Login
          </Link>
        </>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <>
      <Header />
      <main id="main">
        <section className="center-wrap max-w-lg">
          <Suspense fallback={<div className="panel w-full py-12 text-center text-slate-500">Memuat...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </section>
      </main>
      <Footer />
    </>
  );
}
