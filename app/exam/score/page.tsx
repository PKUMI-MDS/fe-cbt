"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthGuard from "@/components/AuthGuard";
import { ApiError } from "@/lib/api";
import { getAttemptResult } from "@/lib/auth-api";
import type { AttemptResult } from "@/lib/types";

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date(value));
}

export default function ScoreDetailPage() {
  const searchParams = useSearchParams();
  const attemptId = searchParams.get("attempt_id");

  const [result, setResult] = useState<AttemptResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        if (!attemptId) {
          setError("ID attempt tidak ditemukan.");
          setIsLoading(false);
          return;
        }
        const data = await getAttemptResult(Number(attemptId));
        setResult(data ?? null);
        if (!data) setError("Data hasil ujian tidak ditemukan.");
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Gagal memuat data skor.");
      } finally {
        setIsLoading(false);
      }
    }
    void load();
  }, [attemptId]);

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

              {/* Section scores */}
              {(result?.listening_score != null || result?.structure_score != null || result?.reading_score != null) && (
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {result?.listening_score != null && (
                    <div className="rounded-xl bg-sky-50 p-4 text-center">
                      <p className="text-xs font-bold text-sky-700">Listening</p>
                      <p className="text-2xl font-extrabold text-sky-700">{result.listening_score}</p>
                    </div>
                  )}
                  {result?.structure_score != null && (
                    <div className="rounded-xl bg-violet-50 p-4 text-center">
                      <p className="text-xs font-bold text-violet-700">Structure</p>
                      <p className="text-2xl font-extrabold text-violet-700">{result.structure_score}</p>
                    </div>
                  )}
                  {result?.reading_score != null && (
                    <div className="rounded-xl bg-amber-50 p-4 text-center">
                      <p className="text-xs font-bold text-amber-700">Reading</p>
                      <p className="text-2xl font-extrabold text-amber-700">{result.reading_score}</p>
                    </div>
                  )}
                </div>
              )}

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

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={`/exam/review?attempt_id=${attemptId}`}
                  className="btn-primary inline-flex items-center justify-center gap-2"
                >
                  Lihat Review Soal & Pembahasan
                </Link>
              </div>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </AuthGuard>
  );
}
