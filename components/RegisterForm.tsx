"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Paperclip } from "lucide-react";
import { ApiError } from "@/lib/api";
import { registerParticipant } from "@/lib/auth-api";
import type { RegisterPayload } from "@/lib/types";

export default function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setFieldErrors({});
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const payload: RegisterPayload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      institution: String(formData.get("institution") ?? ""),
      password: String(formData.get("password") ?? ""),
      password_confirmation: String(formData.get("password_confirmation") ?? ""),
    };

    const nextFieldErrors: Record<string, string> = {};

    if (!/^\d{11,13}$/.test(payload.phone)) {
      nextFieldErrors.phone = "No. WhatsApp harus 11-13 digit angka.";
    }

    if (payload.password.length < 8) {
      nextFieldErrors.password = "Password minimal 8 karakter.";
    }

    if (payload.password !== payload.password_confirmation) {
      nextFieldErrors.password_confirmation = "Konfirmasi password tidak sama.";
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      await registerParticipant(payload);
      window.location.href = "/waiting-approval";
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setFieldErrors({
          name: err.errors?.name?.[0] ?? "",
          email: err.errors?.email?.[0] ?? "",
          phone: err.errors?.phone?.[0] ?? "",
          institution: err.errors?.institution?.[0] ?? "",
          password: err.errors?.password?.[0] ?? "",
          password_confirmation: err.errors?.password_confirmation?.[0] ?? "",
        });
      } else {
        setError("Registrasi gagal. Coba lagi.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="panel" onSubmit={handleSubmit}>
      {error ? (
        <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="field">
          <span>Nama Lengkap</span>
          <input name="name" placeholder="Nama sesuai identitas" required />
          {fieldErrors.name ? <small className="text-rose-600">{fieldErrors.name}</small> : null}
        </label>
        <label className="field">
          <span>Email</span>
          <input name="email" type="email" placeholder="nama@email.com" required />
          {fieldErrors.email ? <small className="text-rose-600">{fieldErrors.email}</small> : null}
        </label>
        <label className="field">
          <span>No. WhatsApp</span>
          <input name="phone" type="tel" placeholder="08xxxxxxxxxx" required />
          {fieldErrors.phone ? <small className="text-rose-600">{fieldErrors.phone}</small> : null}
        </label>
        <label className="field">
          <span>Institusi</span>
          <input name="institution" placeholder="Nama instansi" />
          {fieldErrors.institution ? <small className="text-rose-600">{fieldErrors.institution}</small> : null}
        </label>

        <label className="field">
          <span>Password</span>
          <input name="password" type="password" placeholder="Minimal 8 karakter" required minLength={8} />
          {fieldErrors.password ? <small className="text-rose-600">{fieldErrors.password}</small> : null}
        </label>
        <label className="field">
          <span>Konfirmasi Password</span>
          <input name="password_confirmation" type="password" placeholder="Ulangi password" required minLength={8} />
          {fieldErrors.password_confirmation ? <small className="text-rose-600">{fieldErrors.password_confirmation}</small> : null}
        </label>
      </div>

      <div className="mt-6 rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50/60 p-6 text-center">
        <Paperclip className="mx-auto h-10 w-10 text-brand-600" />
        <h3 className="mt-4 font-bold text-slate-950">Bukti Pembayaran</h3>
        <p className="mt-1 text-sm text-slate-500">
          Upload bukti transfer dapat dilakukan di menu Dashboard setelah Anda menyelesaikan registrasi dan masuk ke akun Anda.
        </p>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link href="/" className="btn-secondary">
          Batal
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Mengirim..." : "Submit Registrasi"}
        </button>
      </div>
    </form>
  );
}
