"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ApiError } from "@/lib/api";
import { getPaymentProof } from "@/lib/auth-api";
import { getAuthToken } from "@/lib/auth";
import type { PaymentProof } from "@/lib/types";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Clock,
  FileText,
  XCircle,
} from "lucide-react";

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusConfig(status: string) {
  switch (status) {
    case "approved":
      return {
        label: "Disetujui",
        icon: CheckCircle,
        badgeClass:
          "inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700",
        panelClass: "border-emerald-200 bg-emerald-50/20",
      };
    case "rejected":
      return {
        label: "Ditolak",
        icon: XCircle,
        badgeClass:
          "inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-sm font-bold text-rose-700",
        panelClass: "border-rose-200 bg-rose-50/20",
      };
    default:
      return {
        label: "Menunggu Review",
        icon: Clock,
        badgeClass:
          "inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-700",
        panelClass: "border-slate-200",
      };
  }
}

export default function PaymentProofDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [proof, setProof] = useState<PaymentProof | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    async function load() {
      setIsLoading(true);
      try {
        const proof = await getPaymentProof(id);
        setProof(proof);
      } catch (err) {
        setError(
          err instanceof ApiError
            ? err.message
            : "Gagal memuat detail bukti pembayaran.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    void load();
  }, [id]);

  if (isLoading) {
    return (
      <main className="center-wrap max-w-xl">
        <div className="panel w-full text-center">
          <p className="text-sm font-semibold text-slate-500">
            Memuat detail...
          </p>
        </div>
      </main>
    );
  }

  if (error || !proof) {
    return (
      <main className="center-wrap max-w-xl">
        <div className="panel w-full">
          <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            {error || "Bukti pembayaran tidak ditemukan."}
          </div>
          <Link
            href="/payment-proof"
            className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-brand-600 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Pembayaran
          </Link>
        </div>
      </main>
    );
  }

  const cfg = statusConfig(proof.status);
  const StatusIcon = cfg.icon;

  return (
    <main className="center-wrap max-w-xl">
      <div className={`panel w-full ${cfg.panelClass}`}>
        <Link
          href="/payment-proof"
          className="inline-flex items-center gap-2 text-sm font-bold text-brand-600 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Pembayaran
        </Link>

        <div className="mt-6 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-50">
              <FileText className="h-6 w-6 text-brand-600" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-extrabold text-slate-950">
                Detail Bukti Pembayaran
              </h1>
              <p className="text-sm text-slate-500">#{proof.id}</p>
            </div>
          </div>
          <span className={cfg.badgeClass}>
            <StatusIcon className="h-4 w-4" />
            {cfg.label}
          </span>
        </div>

        <div className="mt-6 space-y-4">
          {/* Preview Gambar */}
          {proof.mime_type?.startsWith("image/") ? (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Preview Bukti Pembayaran
              </p>
              <div className="mt-3 overflow-hidden rounded-lg border border-slate-100">
                <img
                  src={`${process.env.NEXT_PUBLIC_API_BASE_URL || "https://be-cbt.pkumionline.cloud/api"}/payment-proofs/${proof.id}/preview`}
                  alt="Bukti pembayaran"
                  className="w-full object-contain max-h-96"
                  headers-authorization={`Bearer ${getAuthToken()}`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                  ref={(img) => {
                    if (img && !img.dataset.loaded) {
                      img.dataset.loaded = "1";
                      const token = getAuthToken();
                      if (token) {
                        fetch(img.src, {
                          headers: { Authorization: `Bearer ${token}` },
                        })
                          .then((res) => res.blob())
                          .then((blob) => {
                            img.src = URL.createObjectURL(blob);
                          })
                          .catch(() => {
                            img.style.display = "none";
                          });
                      }
                    }
                  }}
                />
              </div>
            </div>
          ) : proof.mime_type === "application/pdf" ? (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                File PDF
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Preview PDF tidak tersedia. File tersimpan dengan aman di
                server.
              </p>
            </div>
          ) : null}

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Nama File
            </p>
            <p className="mt-1 font-bold text-slate-950">{proof.file_name}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Tipe File
            </p>
            <p className="mt-1 font-bold text-slate-950">
              {proof.mime_type ?? "-"}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Diupload
              </p>
              <p className="mt-1 font-bold text-slate-950">
                {formatDate(proof.created_at)}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Terakhir Diperbarui
              </p>
              <p className="mt-1 font-bold text-slate-950">
                {formatDate(proof.updated_at)}
              </p>
            </div>
          </div>

          {proof.rejection_reason ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-rose-700">
                Alasan Penolakan
              </p>
              <p className="mt-1 text-sm font-semibold text-rose-700">
                {proof.rejection_reason}
              </p>
            </div>
          ) : null}
        </div>

        <div className="mt-8">
          <Link
            href="/payment-proof"
            className="btn-primary inline-flex w-full items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Daftar Pembayaran
          </Link>
        </div>
      </div>
    </main>
  );
}
