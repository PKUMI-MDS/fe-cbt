"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiError } from "@/lib/api";
import { loginParticipant } from "@/lib/auth-api";
import { useAuthSession } from "@/lib/use-auth-session";
import { clearAuthToken } from "@/lib/auth";

export default function LoginForm() {
  const router = useRouter();
  const { saveSession } = useAuthSession();
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setFieldErrors({});
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      const response = await loginParticipant(email, password);

      if (response.user.role !== "participant") {
        clearAuthToken();
        setError("Akun ini bukan akun peserta. Silakan gunakan portal admin yang sesuai.");
        return;
      }

      await saveSession(response.token);
      router.push(response.user.account_status === "active" ? "/dashboard" : "/waiting-approval");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setFieldErrors({
          email: err.errors?.email?.[0] ?? "",
          password: err.errors?.password?.[0] ?? "",
        });
        if (err.code === 403) {
          router.push(`/waiting-approval?message=${encodeURIComponent(err.message)}`);
        }
      } else {
        setError("Login gagal. Coba lagi.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="panel" onSubmit={handleSubmit}>
      <h2 className="text-2xl font-extrabold text-slate-950">Login Peserta</h2>
      <p className="mt-2 text-sm text-slate-500">
        Masukkan akun yang sudah disetujui admin.
      </p>

      {error ? (
        <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="mt-6 space-y-4">
        <label className="field">
          <span>Email</span>
          <input name="email" type="email" placeholder="nama@email.com" required />
          {fieldErrors.email ? <small className="text-rose-600">{fieldErrors.email}</small> : null}
        </label>
        <label className="field">
          <span>Password</span>
          <input name="password" type="password" placeholder="Masukkan password" required />
          {fieldErrors.password ? <small className="text-rose-600">{fieldErrors.password}</small> : null}
        </label>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 text-sm">
        <label className="flex items-center gap-2 text-slate-500">
          <input type="checkbox" className="rounded" />
          Remember me
        </label>
        <Link href="/forgot-password" className="font-bold text-brand-700">
          Lupa password?
        </Link>
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 w-full justify-center btn-primary disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Memproses..." : "Login"}
      </button>
      <p className="mt-5 text-center text-sm text-slate-500">
        Belum punya akun?{" "}
        <Link href="/register" className="font-bold text-brand-700">
          Daftar sekarang
        </Link>
      </p>
    </form>
  );
}
