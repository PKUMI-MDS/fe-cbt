"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api";
import { uploadPaymentProof } from "@/lib/auth-api";

export default function PaymentProofForm() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      setError("Pilih file bukti pembayaran terlebih dahulu.");
      setIsSubmitting(false);
      return;
    }

    try {
      await uploadPaymentProof({
        file,
        amount: String(formData.get("amount") ?? ""),
        payment_date: String(formData.get("payment_date") ?? ""),
      });
      form.reset();
      setSuccess("Bukti pembayaran berhasil dikirim dan menunggu review admin.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload bukti pembayaran gagal.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="panel" onSubmit={handleSubmit}>
      <h2 className="text-xl font-extrabold text-slate-950">Upload Bukti Pembayaran</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        Format JPG, PNG, atau PDF. Maksimal 5MB.
      </p>

      {error ? (
        <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {success}
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="field sm:col-span-2">
          <span>File Bukti</span>
          <input name="file" type="file" accept=".jpg,.jpeg,.png,.pdf" required />
        </label>
        <label className="field">
          <span>Nominal</span>
          <input name="amount" inputMode="numeric" placeholder="Contoh: 250000" />
        </label>
        <label className="field">
          <span>Tanggal Bayar</span>
          <input name="payment_date" type="date" />
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 w-full justify-center btn-primary disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Mengupload..." : "Upload Bukti"}
      </button>
    </form>
  );
}
