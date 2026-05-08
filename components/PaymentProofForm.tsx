"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { getPaymentProofs, uploadPaymentProof } from "@/lib/auth-api";
import type { PaymentProof } from "@/lib/types";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"];

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(value));
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    pending_review: "Menunggu Review",
    approved: "Disetujui",
    rejected: "Ditolak",
  };

  return labels[status] ?? status;
}

export default function PaymentProofForm() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [proofs, setProofs] = useState<PaymentProof[]>([]);

  async function loadHistory() {
    setIsLoadingHistory(true);

    try {
      const response = await getPaymentProofs();
      setProofs(response.data ?? []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal memuat riwayat pembayaran.");
    } finally {
      setIsLoadingHistory(false);
    }
  }

  useEffect(() => {
    void loadHistory();
  }, []);

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

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Format file harus JPG, PNG, atau PDF.");
      setIsSubmitting(false);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Ukuran file maksimal 5MB.");
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
      await loadHistory();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload bukti pembayaran gagal.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
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

      <section className="panel">
        <h2 className="text-lg font-extrabold text-slate-950">Riwayat Bukti Pembayaran</h2>
        {isLoadingHistory ? (
          <p className="mt-4 text-sm font-semibold text-slate-500">Memuat riwayat...</p>
        ) : proofs.length === 0 ? (
          <p className="mt-4 text-sm leading-6 text-slate-500">
            Belum ada bukti pembayaran yang dikirim.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {proofs.map((proof) => (
              <div key={proof.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                  <div>
                    <p className="font-bold text-slate-950">{proof.file_name}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      Tanggal bayar: {formatDate(proof.payment_date)}
                    </p>
                  </div>
                  <span className={proof.status === "rejected" ? "inline-flex rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700" : proof.status === "approved" ? "badge-success" : "badge-brand"}>
                    {statusLabel(proof.status)}
                  </span>
                </div>
                {proof.rejection_reason ? (
                  <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
                    {proof.rejection_reason}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
