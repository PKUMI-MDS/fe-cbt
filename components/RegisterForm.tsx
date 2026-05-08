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
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const payload: RegisterPayload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      institution: String(formData.get("institution") ?? ""),
      identity_number: String(formData.get("identity_number") ?? ""),
      password: String(formData.get("password") ?? ""),
      password_confirmation: String(formData.get("password_confirmation") ?? ""),
    };

    try {
      await registerParticipant(payload);
      router.push("/waiting-approval");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Registrasi gagal. Coba lagi.");
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
        </label>
        <label className="field">
          <span>Email</span>
          <input name="email" type="email" placeholder="nama@email.com" required />
        </label>
        <label className="field">
          <span>No. WhatsApp</span>
          <input name="phone" type="tel" placeholder="08xxxxxxxxxx" required />
        </label>
        <label className="field">
          <span>Institusi</span>
          <input name="institution" placeholder="Nama instansi" />
        </label>
        <label className="field">
          <span>Nomor Identitas</span>
          <input name="identity_number" placeholder="NIK/NIM/NIP" />
        </label>
        <label className="field">
          <span>Jenis Ujian</span>
          <select name="exam_type" defaultValue="toafl">
            <option value="toafl">TOAFL - Arabic Proficiency Test</option>
            <option value="toefl">TOEFL - English Proficiency Test</option>
            <option value="toafic">TOAFIC</option>
            <option value="toefic">TOEFIC</option>
          </select>
        </label>
        <label className="field">
          <span>Password</span>
          <input name="password" type="password" placeholder="Minimal 8 karakter" required />
        </label>
        <label className="field">
          <span>Konfirmasi Password</span>
          <input name="password_confirmation" type="password" placeholder="Ulangi password" required />
        </label>
      </div>

      <div className="mt-6 rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50/60 p-6 text-center">
        <Paperclip className="mx-auto h-10 w-10 text-brand-600" />
        <h3 className="mt-4 font-bold text-slate-950">Bukti Pembayaran</h3>
        <p className="mt-1 text-sm text-slate-500">
          Upload bukti pembayaran disiapkan terpisah karena endpoint backend saat ini membutuhkan sesi login.
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
