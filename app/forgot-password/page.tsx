"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { forgotPassword } from "@/lib/auth-api";
import { LifeBuoy, Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await forgotPassword({ email });
      setIsSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim permintaan reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main id="main">
        <section className="center-wrap max-w-lg">
          <div className="panel w-full">
            {isSent ? (
              <div className="text-center">
                <CheckCircle className="mx-auto h-10 w-10 text-emerald-600" />
                <h1 className="mt-4 text-2xl font-extrabold text-slate-950">Email Terkirim</h1>
                <p className="mt-2 text-sm text-slate-500">
                  Jika email <strong>{email}</strong> terdaftar, Anda akan menerima instruksi reset password.
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Periksa folder inbox atau spam Anda.
                </p>
                <Link
                  href="/login"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Kembali ke Login
                </Link>
              </div>
            ) : (
              <>
                <LifeBuoy className="h-10 w-10 text-brand-600" />
                <h1 className="mt-2 text-2xl font-extrabold text-slate-950">
                  Lupa Password
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                  Masukkan email akun Anda. Kami akan mengirimkan token reset password.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                      Email
                    </label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="field w-full pl-10"
                        placeholder="nama@email.com"
                      />
                    </div>
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
                    {isLoading ? "Mengirim..." : "Kirim Token Reset"}
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
        </section>
      </main>
      <Footer />
    </>
  );
}
