"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { getPaymentProofs, uploadPaymentProof } from "@/lib/auth-api";
import type { PaymentProof } from "@/lib/types";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Upload,
  XCircle,
} from "lucide-react";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"];

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(
    new Date(value)
  );
}

function statusConfig(status: string) {
  switch (status) {
    case "approved":
      return {
        label: "Disetujui",
        icon: CheckCircle,
        badgeClass:
          "inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700",
        cardClass: "border-emerald-200 bg-emerald-50/30",
      };
    case "rejected":
      return {
        label: "Ditolak",
        icon: XCircle,
        badgeClass:
          "inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700",
        cardClass: "border-rose-200 bg-rose-50/30",
      };
    default:
      return {
        label: "Menunggu Review",
        icon: Clock,
        badgeClass:
          "inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700",
        cardClass: "border-slate-200",
      };
  }
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
      setError(
        err instanceof ApiError
          ? err.message
          : "Gagal memuat riwayat pembayaran."
      );
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
      });
      form.reset();
      setSuccess("Bukti pembayaran berhasil dikirim dan menunggu review admin.");
      await loadHistory();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Upload bukti pembayaran gagal."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const hasRejected = proofs.some((p) => p.status === "rejected");

  return (
    <div className="space-y-5">
      {/* Upload Form */}
      <form id="payment-proof-form" className="panel" onSubmit={handleSubmit}>
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50">
            <Upload className="h-5 w-5 text-brand-600" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-950">
              Upload Bukti Pembayaran
            </h2>
            <p className="text-sm text-slate-500">
              Format JPG, PNG, atau PDF. Maksimal 5MB.
            </p>
          </div>
        </div>

        {error ? (
          <div className="mt-5 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="mt-5 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {success}
          </div>
        ) : null}

        <div className="mt-6 grid gap-4">
          <label className="field">
            <span>File Bukti</span>
            <input
              name="file"
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              required
              className="file:mr-4 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-bold file:text-brand-700 hover:file:bg-brand-100"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 w-full justify-center btn-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Mengupload..." : "Upload Bukti Pembayaran"}
        </button>
      </form>

      {/* Rejection Alert */}
      {hasRejected ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
            <div>
              <p className="text-sm font-bold text-rose-800">
                Bukti pembayaran Anda ditolak
              </p>
              <p className="mt-1 text-sm text-rose-700">
                Silakan periksa alasan penolakan di bawah dan upload ulang bukti
                yang lebih jelas. Hubungi admin jika membutuhkan bantuan.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* History */}
      <section className="panel">
        <h2 className="text-lg font-extrabold text-slate-950">
          Riwayat Bukti Pembayaran
        </h2>
        {isLoadingHistory ? (
          <p className="mt-4 text-sm font-semibold text-slate-500">
            Memuat riwayat...
          </p>
        ) : proofs.length === 0 ? (
          <div className="mt-4 rounded-xl bg-slate-50 p-6 text-center">
            <FileText className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2 text-sm text-slate-500">
              Belum ada bukti pembayaran yang dikirim.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {proofs.map((proof) => {
              const cfg = statusConfig(proof.status);
              const StatusIcon = cfg.icon;
              return (
                <div
                  key={proof.id}
                  className={`rounded-xl border p-4 transition ${cfg.cardClass}`}
                >
                  <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                        <p className="truncate font-bold text-slate-950">
                          {proof.file_name}
                        </p>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span>
                          Diupload:{" "}
                          <strong className="text-slate-700">
                            {formatDate(proof.created_at)}
                          </strong>
                        </span>
                      </div>
                    </div>
                    <span className={cfg.badgeClass}>
                      <StatusIcon className="h-3.5 w-3.5" />
                      {cfg.label}
                    </span>
                  </div>

                  {proof.rejection_reason ? (
                    <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2">
                      <p className="text-xs font-bold text-rose-700">
                        Alasan Penolakan:
                      </p>
                      <p className="text-sm text-rose-700">
                        {proof.rejection_reason}
                      </p>
                    </div>
                  ) : null}

                  {proof.status === "rejected" ? (
                    <button
                      type="button"
                      onClick={() => {
                        const formEl =
                          document.getElementById("payment-proof-form");
                        formEl?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-bold text-rose-700 hover:bg-rose-50 transition"
                    >
                      <Upload className="h-4 w-4" />
                      Upload Ulang
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
