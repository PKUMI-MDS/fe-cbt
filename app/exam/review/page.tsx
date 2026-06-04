"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Play, CheckCircle2, XCircle, ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthGuard from "@/components/AuthGuard";
import { ApiError } from "@/lib/api";
import { getAttemptReview } from "@/lib/auth-api";
import type { Question } from "@/lib/types";

interface ReviewData {
  attempt_id: number;
  session_title: string | null;
  status: string;
  submitted_at: string | null;
  total_questions: number;
  questions: Question[];
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeStyle: "short" }).format(new Date(value));
}

export default function ExamReviewPage() {
  const searchParams = useSearchParams();
  const attemptId = searchParams.get("attempt_id");

  const [data, setData] = useState<ReviewData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
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
        const review = await getAttemptReview(Number(attemptId));
        setData(review);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Gagal memuat data review.");
        }
      } finally {
        setIsLoading(false);
      }
    }
    void load();
  }, [attemptId]);

  const currentQ = data?.questions?.[currentIndex];
  const total = data?.total_questions ?? 0;

  function handlePrev() {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  }

  function handleNext() {
    if (currentIndex < total - 1) setCurrentIndex((i) => i + 1);
  }

  return (
    <AuthGuard>
      <Header />
      <main id="main">
        <section className="page-wrap max-w-4xl">
          <Link href={`/exam/score?attempt_id=${attemptId}`} className="btn-secondary mb-4 inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Hasil
          </Link>

          {isLoading ? (
            <div className="panel text-sm font-semibold text-slate-500">Memuat review soal...</div>
          ) : error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {error}
            </div>
          ) : data && currentQ ? (
            <>
              {/* Header */}
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="eyebrow">Review Soal & Pembahasan</p>
                  <h1 className="mt-1 text-xl font-extrabold text-slate-950">
                    {data.session_title ?? "Ujian"}
                  </h1>
                </div>
                <div className="text-sm text-slate-500">
                  Soal {currentIndex + 1} dari {total}
                </div>
              </div>

              {/* Navigation Grid */}
              <div className="mb-6 flex flex-wrap gap-2">
                {data.questions.map((q, idx) => {
                  const isCorrect = q.correct_option_id != null && q.selected_option_id === q.correct_option_id;
                  const isWrong = q.selected_option_id != null && q.selected_option_id !== q.correct_option_id;
                  const isUnanswered = q.selected_option_id == null;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`grid h-9 w-9 place-items-center rounded-lg text-xs font-bold transition ${
                        idx === currentIndex
                          ? "bg-brand-600 text-white"
                          : isCorrect
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                            : isWrong
                              ? "bg-rose-100 text-rose-700 hover:bg-rose-200"
                              : isUnanswered
                                ? "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Question Card */}
              <div className="panel space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="badge-brand">{currentQ.section_type ?? "Soal"}</span>
                  {currentQ.correct_option_id != null && currentQ.selected_option_id === currentQ.correct_option_id && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                      <CheckCircle2 className="h-3 w-3" />
                      Benar
                    </span>
                  )}
                  {currentQ.selected_option_id != null && currentQ.selected_option_id !== currentQ.correct_option_id && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">
                      <XCircle className="h-3 w-3" />
                      Salah
                    </span>
                  )}
                  {currentQ.selected_option_id == null && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                      Tidak Dijawab
                    </span>
                  )}
                </div>

                {/* Stem */}
                <div
                  className="prose max-w-none text-slate-950"
                  dangerouslySetInnerHTML={{ __html: currentQ.stem_html ?? "<p>Memuat soal...</p>" }}
                />

                {/* Image */}
                {currentQ.image_url ? (
                  <div className="relative h-72 w-full">
                    <Image
                      src={currentQ.image_url}
                      alt="Gambar soal"
                      fill
                      className="rounded-xl object-contain"
                      unoptimized
                    />
                  </div>
                ) : null}

                {/* Audio */}
                {currentQ.audio_url ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="mb-2 text-sm font-bold text-slate-700">Audio soal</p>
                    <audio controls className="w-full" src={currentQ.audio_url} />
                  </div>
                ) : null}

                {/* Options */}
                <div className="space-y-3">
                  {(currentQ.options ?? []).map((opt) => {
                    const isSelected = currentQ.selected_option_id === opt.id;
                    const isCorrect = opt.is_correct === true;
                    const isWrongSelected = isSelected && !isCorrect;

                    let cardClass = "rounded-xl border-2 px-5 py-4 text-sm transition ";
                    if (isCorrect) {
                      cardClass += "border-emerald-300 bg-emerald-50 text-emerald-900";
                    } else if (isWrongSelected) {
                      cardClass += "border-rose-300 bg-rose-50 text-rose-900";
                    } else if (isSelected) {
                      cardClass += "border-brand-300 bg-brand-50 text-brand-900";
                    } else {
                      cardClass += "border-slate-200 bg-white text-slate-700";
                    }

                    return (
                      <div key={opt.id} className={cardClass}>
                        <div className="flex items-start gap-3">
                          <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                            {opt.option_key ?? ""}
                          </span>
                          <span
                            className={`flex-1 ${currentQ.section_type?.includes("arabic") || currentQ.section?.includes("arabic") ? "arabic text-xl" : ""}`}
                            dangerouslySetInnerHTML={{ __html: opt.option_html ?? "" }}
                          />
                          {isCorrect && <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />}
                          {isWrongSelected && <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation / Pembahasan */}
                {currentQ.explanation_html ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                    <div className="mb-2 flex items-center gap-2 text-sm font-bold text-amber-800">
                      <BookOpen className="h-4 w-4" />
                      Pembahasan
                    </div>
                    <div
                      className="prose max-w-none text-sm leading-7 text-amber-900"
                      dangerouslySetInnerHTML={{ __html: currentQ.explanation_html }}
                    />
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                    Tidak ada pembahasan untuk soal ini.
                  </div>
                )}
              </div>

              {/* Bottom Navigation */}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentIndex <= 0}
                  className="btn-secondary inline-flex items-center gap-2 disabled:opacity-40"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Sebelumnya
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={currentIndex >= total - 1}
                  className="btn-primary inline-flex items-center gap-2 disabled:opacity-40"
                >
                  Berikutnya
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : null}
        </section>
      </main>
      <Footer />
    </AuthGuard>
  );
}
