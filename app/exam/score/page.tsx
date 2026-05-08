"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthGuard from "@/components/AuthGuard";
import { ApiError } from "@/lib/api";
import { getResultHistory } from "@/lib/auth-api";
import type { ExamResult } from "@/lib/types";

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date(value));
}

export default function ScoreDetailPage() {
  const searchParams = useSearchParams();
  const resultId = searchParams.get("result_id");

  const [result, setResult] = useState<ExamResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await getResultHistory();
        const found = resultId
          ? (res.data ?? []).find((r) => String(r.id) === resultId)
          : (res.data ?? [])[0];
        setResult(found ?? null);
        if (!found) setError("Data hasil ujian tidak ditemukan.");
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Gagal memuat data skor.");
      } finally {
        setIsLoading(false);
      }
    }
    void load();
  }, [resultId]);

  return (
    <AuthGuard>
      <Header />
      <main id="main">
        <section className="page-wrap max-w-4xl">
          <Link href="/exam/history" className="btn-secondary mb-6">
            Kembali ke Riwayat
          </Link>

          {isLoading ? (
            <div className="panel mt-6 text-sm font-semibold text-slate-500">
              Memuat detail skor...
            </div>
          ) : error ? (
            <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {error}
            </div>
          ) : (
            <div className="panel mt-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <p className="eyebrow">Detail Hasil Ujian</p>
                  <h1 className="mt-2 text-3xl font-extrabold text-slate-950">
                    {result?.exam_session?.title ?? "Hasil Ujian"}
                  </h1>
                  <p className="mt-2 text-slate-500">
                    {formatDate(result?.created_at)}
                  </p>
                </div>

                {result?.total_score != null ? (
                  <div className="rounded-xl bg-brand-50 p-6 text-center">
                    <p className="text-xs font-bold uppercase text-brand-700">Total Skor</p>
                    <p className="mt-1 text-4xl font-extrabold text-brand-700">
                      {result.total_score}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl bg-slate-50 p-6 text-center">
                    <p className="text-xs font-bold uppercase text-slate-500">Total Skor</p>
                    <p className="mt-1 text-xl font-extrabold text-slate-400">
                      Menunggu
                    </p>
                  </div>
                )}
              </div>

              {/* Score breakdown */}
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="info-box">
                  <small>Listening</small>
                  <strong className="text-3xl">{result?.listening_score ?? "-"}</strong>
                </div>
                <div className="info-box">
                  <small>Structure</small>
                  <strong className="text-3xl">{result?.structure_score ?? "-"}</strong>
                </div>
                <div className="info-box">
                  <small>Reading</small>
                  <strong className="text-3xl">{result?.reading_score ?? "-"}</strong>
                </div>
              </div>

              {/* Answer stats if available */}
              {(result?.correct_count != null || result?.wrong_count != null) ? (
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-emerald-50 p-4 text-center">
                    <p className="text-xs font-bold text-emerald-700">Benar</p>
                    <p className="text-2xl font-extrabold text-emerald-700">
                      {result?.correct_count ?? "-"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-rose-50 p-4 text-center">
                    <p className="text-xs font-bold text-rose-700">Salah</p>
                    <p className="text-2xl font-extrabold text-rose-700">
                      {result?.wrong_count ?? "-"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4 text-center">
                    <p className="text-xs font-bold text-slate-500">Tidak Dijawab</p>
                    <p className="text-2xl font-extrabold text-slate-500">
                      {result?.unanswered_count ?? "-"}
                    </p>
                  </div>
                </div>
              ) : null}

              <div className="mt-6 rounded-xl bg-amber-50 p-5 text-sm leading-6 text-amber-800">
                Review soal dan kunci jawaban tidak ditampilkan untuk menjaga keamanan bank soal.
              </div>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </AuthGuard>
  );
}
