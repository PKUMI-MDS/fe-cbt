"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthGuard from "@/components/AuthGuard";
import { CheckCircle2 } from "lucide-react";

import { getAttemptResult } from "@/lib/auth-api";
import type { AttemptResult } from "@/lib/types";

export default function ExamCompletedPage() {
  const searchParams = useSearchParams();
  const attemptId = searchParams.get("attempt_id");
  const showResultParam = searchParams.get("show_result");

  const [result, setResult] = useState<AttemptResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadResult() {
      if (!attemptId) { setIsLoading(false); return; }
      try {
        const data = await getAttemptResult(Number(attemptId));
        setResult(data);
      } catch {
        // result mungkin belum publish — bukan error fatal
      } finally {
        setIsLoading(false);
      }
    }
    void loadResult();
  }, [attemptId]);

  const showResult = showResultParam === "true" || result?.show_result === true;
  const answered = (result
    ? (result.correct_count ?? 0) + (result.wrong_count ?? 0)
    : null);
  const total = result
    ? (result.correct_count ?? 0) + (result.wrong_count ?? 0) + (result.unanswered_count ?? 0)
    : null;

  return (
    <AuthGuard>
      <Header />
      <main id="main">
        <section className="center-wrap">
          <div className="status-panel border border-emerald-200">
            <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-600" />
            <h1>Ujian Berhasil Disubmit</h1>
            <p>
              Jawaban sudah tersimpan.{" "}
              {showResult
                ? "Hasil ujian dapat dilihat di bawah ini."
                : "Hasil akan ditampilkan setelah admin mengaktifkan visibilitas skor."}
            </p>

            <div className="status-grid">
              <div>
                <small>Status</small>
                <strong className="text-emerald-700">Submitted</strong>
              </div>
              <div>
                <small>Dijawab</small>
                <strong>
                  {isLoading ? "..." : total !== null ? `${answered}/${total}` : "-"}
                </strong>
              </div>
              <div>
                <small>Total Skor</small>
                <strong className={showResult && result?.total_score ? "text-brand-700" : "text-slate-500"}>
                  {isLoading
                    ? "..."
                    : showResult && result?.total_score != null
                    ? String(result.total_score)
                    : "Hidden"}
                </strong>
              </div>
            </div>

            {showResult && result && (
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="info-box">
                  <small>Listening</small>
                  <strong className="text-2xl">{result.listening_score ?? "-"}</strong>
                </div>
                <div className="info-box">
                  <small>Structure</small>
                  <strong className="text-2xl">{result.structure_score ?? "-"}</strong>
                </div>
                <div className="info-box">
                  <small>Reading</small>
                  <strong className="text-2xl">{result.reading_score ?? "-"}</strong>
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/dashboard" className="btn-primary">
                Dashboard
              </Link>
              <Link href="/exam/history" className="btn-secondary">
                Lihat Riwayat
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </AuthGuard>
  );
}
