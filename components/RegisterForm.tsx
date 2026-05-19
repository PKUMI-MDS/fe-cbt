"use client";

import Link from "next/link";
import { useState } from "react";
import { Paperclip, Upload, FileImage, FileText, X, CheckCircle2 } from "lucide-react";
import PaymentInfo from "@/components/PaymentInfo";
import { ApiError } from "@/lib/api";
import { registerParticipant } from "@/lib/auth-api";
import type { RegisterPayload } from "@/lib/types";

export default function RegisterForm() {
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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

    const file = selectedFile;

    const nextFieldErrors: Record<string, string> = {};

    if (!/^\d{11,13}$/.test(payload.phone || "")) {
      nextFieldErrors.phone = "No. WhatsApp harus 11-13 digit angka.";
    }

    if (payload.password.length < 8) {
      nextFieldErrors.password = "Password minimal 8 karakter.";
    }

    if (payload.password !== payload.password_confirmation) {
      nextFieldErrors.password_confirmation = "Konfirmasi password tidak sama.";
    }

    if (!file) {
      nextFieldErrors.payment_proof = "Bukti pembayaran wajib diupload.";
    } else {
      const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
      if (!allowedTypes.includes(file.type)) {
        nextFieldErrors.payment_proof = "Format file harus JPG, PNG, atau PDF.";
      }
      if (file.size > 5 * 1024 * 1024) {
        nextFieldErrors.payment_proof = "Ukuran file maksimal 5MB.";
      }
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setIsSubmitting(false);
      return;
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setIsSubmitting(false);
      return;
    }

    if (file) {
      payload.payment_proof = file;
    }

    try {
      await registerParticipant(payload);
      window.location.href = `/waiting-approval?registered=1&email=${encodeURIComponent(payload.email)}`;
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

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setFieldErrors((prev) => ({ ...prev, payment_proof: "" }));

    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  }

  function removeFile() {
    setSelectedFile(null);
    setPreviewUrl(null);
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
          <input name="phone" type="tel" placeholder="08xxxxxxxxxx" required minLength={11} maxLength={13} pattern="\d{11,13}" title="Masukkan 11-13 digit angka" />
          <small className="text-slate-400">Minimal 11 digit, maksimal 13 digit angka.</small>
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

      <PaymentInfo />

      <div className="mt-6 rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50/60 p-6">
        <div className="text-center">
          <Upload className="mx-auto h-10 w-10 text-brand-600" />
          <h3 className="mt-4 font-bold text-slate-950">Bukti Pembayaran</h3>
          <p className="mt-1 text-sm text-slate-500">
            Upload bukti transfer sebagai syarat registrasi. Admin akan mereview akun dan bukti pembayaran Anda sekaligus.
          </p>
        </div>

        {selectedFile ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-white p-4">
            <div className="flex items-start gap-3">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="h-16 w-16 rounded-lg border border-slate-200 object-cover"
                />
              ) : selectedFile.type === "application/pdf" ? (
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-lg border border-rose-200 bg-rose-50">
                  <FileText className="h-8 w-8 text-rose-500" />
                </div>
              ) : (
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-lg border border-emerald-200 bg-emerald-50">
                  <FileImage className="h-8 w-8 text-emerald-500" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-900">{selectedFile.name}</p>
                <p className="text-xs text-slate-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="h-3 w-3" />
                    Siap diupload
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                title="Hapus file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : null}

        <label className="mt-4 block cursor-pointer">
          <input
            name="payment_proof"
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            className="hidden"
            required
            onChange={handleFileChange}
          />
          <div className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
              selectedFile
                ? "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                : "border-brand-200 bg-white text-brand-700 hover:bg-brand-50"
            }`}>
            <Paperclip className="h-4 w-4" />
            {selectedFile ? "Ganti File" : "Pilih File (JPG, PNG, PDF, max 5MB)"}
          </div>
          {fieldErrors.payment_proof ? (
            <small className="mt-1 block text-rose-600">{fieldErrors.payment_proof}</small>
          ) : null}
        </label>
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
