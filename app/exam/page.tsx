"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Play } from "lucide-react";
import Toast from "@/components/Toast";
import AuthGuard from "@/components/AuthGuard";
import { ApiError } from "@/lib/api";
import {
  getActiveAttempt,
  getQuestion,
  logAudioPlay,
  logViolation,
  markDoubtful,
  navigateQuestion,
  saveAnswer,
  sendHeartbeat,
  submitExam,
} from "@/lib/auth-api";
import type { AttemptResult, Question } from "@/lib/types";
import ExamSkeleton from "@/components/ExamSkeleton";

const HEARTBEAT_INTERVAL_MS = 30_000;

function formatTime(seconds: number) {
  if (seconds <= 0) return "00:00:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

export default function ExamPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const attemptIdParam = searchParams.get("attempt_id");

  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [currentQ, setCurrentQ] = useState<Question | null>(null);
  const [currentNumber, setCurrentNumber] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [answeredMap, setAnsweredMap] = useState<Record<number, number | null>>({});
  const [doubtfulSet, setDoubtfulSet] = useState<Set<number>>(new Set());
  const [saveState, setSaveState] = useState<"Saved" | "Saving..." | "Failed">("Saved");
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setSubmitResult] = useState<AttemptResult | null>(null);
  const [error, setError] = useState("");

  // P1: Exam Reliability States
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const MAX_VIOLATIONS = 3;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load attempt on mount
  useEffect(() => {
    async function initExam() {
      try {
        let id: number | null = attemptIdParam ? Number(attemptIdParam) : null;

        if (!id) {
          const active = await getActiveAttempt();
          if (!active) {
            setError("Tidak ada ujian aktif. Kembali ke dashboard.");
            setIsLoading(false);
            return;
          }
          id = active.attempt.id;
          setRemainingSeconds(active.attempt.remaining_seconds ?? 0);
          setTotalQuestions(active.attempt.total_questions ?? 0);
          setCurrentNumber(active.attempt.current_question_number ?? 1);
        } else {
          // attempt_id dari URL: WAJIB fetch remaining_seconds dari backend
          // agar timer tidak mulai dari 0 dan langsung auto-submit!
          try {
            const active = await getActiveAttempt();
            if (active && active.attempt.id === id) {
              setRemainingSeconds(active.attempt.remaining_seconds ?? 1800);
              setTotalQuestions(active.attempt.total_questions ?? 0);
              setCurrentNumber(active.attempt.current_question_number ?? 1);
            } else {
              // Fallback: heartbeat untuk dapat remaining_seconds
              const hb = await sendHeartbeat(id);
              setRemainingSeconds(hb.remaining_seconds > 0 ? hb.remaining_seconds : 1800);
            }
          } catch {
            setRemainingSeconds(1800); // default 30 menit agar tidak auto-submit
          }
        }

        setAttemptId(id);
        const q = await getQuestion(id, currentNumber);
        setCurrentQ(q);
        if (q.total) setTotalQuestions(q.total);

        // Restore answered from question's selected_option_id
        if (q.selected_option_id) {
          setAnsweredMap((prev) => ({ ...prev, [currentNumber]: q.selected_option_id! }));
        }
        if (q.is_doubtful) {
          setDoubtfulSet((prev) => new Set(prev).add(currentNumber));
        }
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Gagal memuat soal ujian.");
      } finally {
        setIsLoading(false);
      }
    }
    void initExam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer countdown — guard: jangan mulai jika remainingSeconds belum di-fetch (masih 0)
  useEffect(() => {
    if (!attemptId || isLoading || remainingSeconds <= 0) return;
    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          void handleSubmitFinal(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptId, isLoading, remainingSeconds > 0]);

  // Heartbeat
  useEffect(() => {
    if (!attemptId || isLoading) return;
    heartbeatRef.current = setInterval(async () => {
      try {
        const hb = await sendHeartbeat(attemptId);
        setRemainingSeconds(hb.remaining_seconds);
        if (hb.status === "submitted" || hb.status === "timeout") {
          router.push("/exam/completed");
        }
      } catch {
        // silent fail
      }
    }, HEARTBEAT_INTERVAL_MS);
    return () => clearInterval(heartbeatRef.current!);
  }, [attemptId, isLoading, router]);

  const handleViolation = useCallback(
    async (type: string, detail: string) => {
      if (!attemptId) return;
      try {
        await logViolation(attemptId, { type, detail });
        setViolationCount((prev) => {
          const next = prev + 1;
          if (next >= MAX_VIOLATIONS) {
            setShowViolationModal(true);
          }
          return next;
        });
        setToast(`Peringatan: ${detail}. Jangan diulangi!`);
      } catch {
        // silent fail if unable to log
      }
    },
    [attemptId]
  );

  // Anti-cheat & Route Guard
  useEffect(() => {
    if (!attemptId || isLoading || error) return;

    // 1. Route guard (prevent refresh / leave)
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
      return "";
    };

    // 2. Fullscreen change
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullScreen(false);
        handleViolation("fullscreen_exit", "Peserta keluar dari mode fullscreen");
      } else {
        setIsFullScreen(true);
      }
    };

    // 3. Tab switch (visibility change)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleViolation("tab_switch", "Peserta berpindah tab atau meminimalkan browser");
      }
    };

    // 4. Disable right click/copy
    const preventAction = (e: Event) => {
      e.preventDefault();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    // Disable right click, copy, cut, paste, selectstart
    document.addEventListener("contextmenu", preventAction);
    document.addEventListener("copy", preventAction);
    document.addEventListener("cut", preventAction);
    document.addEventListener("paste", preventAction);
    document.addEventListener("selectstart", preventAction);

    // Initial check in case it's somehow already fullscreen
    if (document.fullscreenElement) {
      setIsFullScreen(true);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("contextmenu", preventAction);
      document.removeEventListener("copy", preventAction);
      document.removeEventListener("cut", preventAction);
      document.removeEventListener("paste", preventAction);
      document.removeEventListener("selectstart", preventAction);
    };
  }, [attemptId, isLoading, error, handleViolation]);

  const enterFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {
        setToast("Gagal masuk fullscreen. Pastikan browser mendukung.");
      });
    }
  };

  const loadQuestion = useCallback(async (id: number, number: number) => {
    try {
      const q = await getQuestion(id, number);
      setCurrentQ(q);
      setCurrentNumber(number);
      if (q.selected_option_id) {
        setAnsweredMap((prev) => ({ ...prev, [number]: q.selected_option_id! }));
      }
      if (q.is_doubtful) {
        setDoubtfulSet((prev) => new Set(prev).add(number));
      }
    } catch (err) {
      setToast(err instanceof ApiError ? err.message : "Gagal memuat soal.");
    }
  }, []);

  const goToQuestion = useCallback(
    async (n: number) => {
      if (!attemptId) return;
      try {
        await navigateQuestion(attemptId, n);
      } catch {
        // navigate API optional — load tetap jalan
      }
      await loadQuestion(attemptId, n);
    },
    [attemptId, loadQuestion]
  );

  const handleSelectAnswer = useCallback(
    async (optionId: number) => {
      if (!attemptId || !currentQ) return;
      setSaveState("Saving...");
      setAnsweredMap((prev) => ({ ...prev, [currentNumber]: optionId }));
      try {
        await saveAnswer(attemptId, currentQ.id, optionId);
        setSaveState("Saved");
      } catch (err) {
        setSaveState("Failed");
        setToast(err instanceof ApiError ? err.message : "Gagal menyimpan jawaban.");
      }
    },
    [attemptId, currentQ, currentNumber]
  );

  const handleDoubtful = useCallback(async () => {
    if (!attemptId || !currentQ) return;
    const newValue = !doubtfulSet.has(currentNumber);
    setDoubtfulSet((prev) => {
      const next = new Set(prev);
      if (newValue) next.add(currentNumber); else next.delete(currentNumber);
      return next;
    });
    try {
      await markDoubtful(attemptId, currentQ.id, newValue);
      setToast(newValue ? "Soal ditandai ragu-ragu" : "Tanda ragu-ragu dihapus");
    } catch {
      // revert
      setDoubtfulSet((prev) => {
        const next = new Set(prev);
        if (newValue) next.delete(currentNumber); else next.add(currentNumber);
        return next;
      });
    }
  }, [attemptId, currentQ, currentNumber, doubtfulSet]);

  const handlePlayAudio = useCallback(async () => {
    if (!attemptId || !currentQ) return;
    try {
      const result = await logAudioPlay(attemptId, currentQ.id);
      if (!result.allowed) {
        setToast(`Batas putar audio (${result.max_play}x) sudah tercapai`);
        return;
      }
      // Update play count on current question
      setCurrentQ((prev) =>
        prev ? { ...prev, audio_play_count: result.play_count } : prev
      );
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        void audioRef.current.play();
      }
    } catch {
      setToast("Gagal memutar audio.");
    }
  }, [attemptId, currentQ]);

  const handleSubmitFinal = useCallback(
    async (autoSubmit = false) => {
      if (!attemptId) return;
      setIsSubmitting(true);
      try {
        const result = await submitExam(attemptId);
        setSubmitResult(result);
        clearInterval(timerRef.current!);
        clearInterval(heartbeatRef.current!);
        router.push(
          `/exam/completed?attempt_id=${attemptId}&show_result=${result.show_result ?? false}`
        );
      } catch (err) {
        if (!autoSubmit) {
          setToast(err instanceof ApiError ? err.message : "Gagal submit ujian.");
        }
        setIsSubmitting(false);
        setShowModal(false);
      }
    },
    [attemptId, router]
  );

  const answeredCount = Object.values(answeredMap).filter((v) => v !== null && v !== undefined).length;
  const emptyCount = totalQuestions - answeredCount;
  const doubtfulCount = doubtfulSet.size;
  const selectedOptionId = answeredMap[currentNumber] ?? null;

  // ─── Error/Loading states ──────────────────────────────────────────────────
  if (isLoading) {
    return (
      <AuthGuard>
        <ExamSkeleton />
      </AuthGuard>
    );
  }

  if (error) {
    return (
      <AuthGuard>
        <section className="center-wrap">
          <div className="panel max-w-lg text-center">
            <p className="text-sm font-semibold text-rose-700">{error}</p>
            <a href="/dashboard" className="btn-primary mt-4 inline-flex">
              Kembali ke Dashboard
            </a>
          </div>
        </section>
      </AuthGuard>
    );
  }

  if (!isFullScreen) {
    return (
      <AuthGuard>
        <Toast message={toast} onHide={() => setToast("")} />
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-900 px-4 text-center">
          <div className="max-w-md rounded-2xl bg-white p-8 shadow-2xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
              <span className="text-2xl">🖥️</span>
            </div>
            <h2 className="mb-4 text-2xl font-extrabold text-slate-900">Masuk Mode Fullscreen</h2>
            <p className="mb-6 text-sm leading-relaxed text-slate-500">
              Ujian ini mewajibkan mode layar penuh (fullscreen) untuk mencegah kecurangan. 
              Segala aktivitas keluar dari fullscreen atau pindah tab akan dicatat sebagai pelanggaran.
            </p>
            <button
              type="button"
              onClick={enterFullscreen}
              className="btn-primary w-full"
            >
              Mulai / Lanjutkan Ujian
            </button>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Toast message={toast} onHide={() => setToast("")} />

      <section className="min-h-screen bg-slate-100">
        {/* Sticky Header */}
        <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <div>
              <p className="text-xs font-bold uppercase text-slate-400">
                {currentQ?.section_type ?? currentQ?.section ?? "Ujian"}
              </p>
              <h1 className="text-base font-extrabold text-slate-950">
                Soal <span>{currentNumber}</span> dari {totalQuestions}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`hidden rounded-full px-3 py-1 text-xs font-bold sm:inline-flex ${
                  saveState === "Saved"
                    ? "bg-emerald-50 text-emerald-700"
                    : saveState === "Saving..."
                    ? "bg-amber-50 text-amber-700"
                    : "bg-rose-50 text-rose-700"
                }`}
              >
                {saveState}
              </span>
              <span
                className={`rounded-xl px-4 py-2 font-mono text-sm font-extrabold ${
                  remainingSeconds < 300 ? "bg-rose-50 text-rose-700" : "bg-slate-100 text-slate-700"
                }`}
              >
                {formatTime(remainingSeconds)}
              </span>
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800 transition"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_320px] lg:px-8">
          {/* Main Content */}
          <div className="space-y-5 animate-fade-in-up">
            <div className="panel">
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className="badge-brand">{currentQ?.section_type ?? "Soal"}</span>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                  Auto-save aktif
                </span>
              </div>

              {/* Stem */}
              <div
                className="prose max-w-none text-slate-950"
                dangerouslySetInnerHTML={{ __html: currentQ?.stem_html ?? "<p>Memuat soal...</p>" }}
              />

              {/* Image */}
              {currentQ?.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentQ.image_url}
                  alt="Gambar soal"
                  className="mt-4 max-h-72 rounded-xl object-contain"
                />
              ) : null}

              {/* Audio Player */}
              {currentQ?.audio_url ? (
                <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="mb-3 text-sm font-bold text-slate-700">
                    Audio soal ({currentQ.audio_play_count ?? 0}/{currentQ.audio_max_play ?? 1}x dimainkan)
                  </p>
                  <audio ref={audioRef} src={currentQ.audio_url} preload="none" />
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => void handlePlayAudio()}
                      className={`grid h-11 w-11 place-items-center rounded-full text-white ${
                        (currentQ.audio_play_count ?? 0) >= (currentQ.audio_max_play ?? 1)
                          ? "bg-slate-300"
                          : "bg-brand-600 hover:bg-brand-700"
                      }`}
                      aria-label="Putar audio"
                      disabled={(currentQ.audio_play_count ?? 0) >= (currentQ.audio_max_play ?? 1)}
                    >
                      <Play className="h-4 w-4 fill-current" />
                    </button>
                    <div className="h-2 flex-1 rounded-full bg-slate-200">
                      <div
                        className="h-2 rounded-full bg-brand-600 transition-all"
                        style={{
                          width: `${Math.min(
                            ((currentQ.audio_play_count ?? 0) / (currentQ.audio_max_play ?? 1)) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-500">
                      {Math.max(0, (currentQ.audio_max_play ?? 1) - (currentQ.audio_play_count ?? 0))} sisa
                    </span>
                  </div>
                </div>
              ) : null}

              {/* Options */}
              <div className="mt-7 space-y-3" role="radiogroup" aria-label="Pilihan Jawaban">
                {(currentQ?.options ?? []).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    role="radio"
                    aria-checked={selectedOptionId === opt.id}
                    onClick={() => void handleSelectAnswer(opt.id)}
                    className={`answer focus:outline-none focus:ring-4 focus:ring-brand-500 focus:border-brand-500 w-full text-left ${selectedOptionId === opt.id ? "selected" : ""}`}
                  >
                    <span
                      className={`block ${currentQ?.section_type?.includes("arabic") || currentQ?.section?.includes("arabic") ? "arabic text-xl" : ""}`}
                      dangerouslySetInnerHTML={{ __html: opt.option_html ?? "" }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-col justify-between gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => void (currentNumber > 1 && goToQuestion(currentNumber - 1))}
                disabled={currentNumber <= 1}
                className="btn-secondary disabled:opacity-40"
              >
                Soal Sebelumnya
              </button>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => void handleDoubtful()}
                  className={`rounded-xl border px-6 py-3 text-sm font-bold transition ${
                    doubtfulSet.has(currentNumber)
                      ? "border-amber-400 bg-amber-400 text-amber-950"
                      : "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                  }`}
                >
                  {doubtfulSet.has(currentNumber) ? "✓ Ragu-ragu" : "Tandai Ragu-ragu"}
                </button>
                <button
                  type="button"
                  onClick={() => void (currentNumber < totalQuestions && goToQuestion(currentNumber + 1))}
                  disabled={currentNumber >= totalQuestions}
                  className="btn-primary disabled:opacity-40"
                >
                  Soal Berikutnya
                </button>
              </div>
            </div>
          </div>

          {/* Question Navigator */}
          <aside className="lg:sticky lg:top-24 lg:h-fit animate-fade-in-up delay-100">
            <div className="panel">
              <h3 className="font-extrabold text-slate-950">Navigasi Soal</h3>
              <div className="mt-5 grid grid-cols-6 gap-2">
                {Array.from({ length: totalQuestions }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-label={`Buka soal ${n}`}
                    onClick={() => void goToQuestion(n)}
                    className={`h-10 rounded-xl text-xs font-extrabold transition focus:outline-none focus:ring-4 focus:ring-brand-100 ${
                      n === currentNumber
                        ? "bg-brand-600 text-white"
                        : doubtfulSet.has(n)
                        ? "bg-amber-400 text-amber-950"
                        : answeredMap[n]
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2 text-xs text-slate-500">
                <p><span className="mr-1 inline-block h-3 w-3 rounded bg-brand-600" />Sekarang</p>
                <p><span className="mr-1 inline-block h-3 w-3 rounded bg-emerald-500" />Dijawab</p>
                <p><span className="mr-1 inline-block h-3 w-3 rounded bg-amber-400" />Ragu-ragu</p>
                <p><span className="mr-1 inline-block h-3 w-3 rounded bg-slate-200" />Belum</p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Violation Modal */}
      {showViolationModal && (
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="violationTitle">
          <div className="modal-panel max-w-sm text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 id="violationTitle" className="text-2xl font-extrabold text-slate-950">
              Peringatan Pelanggaran
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Anda telah melakukan pelanggaran lebih dari batas yang diizinkan (maksimal {MAX_VIOLATIONS} kali). 
              Aktivitas ini telah dicatat. Harap kembali mengerjakan ujian dengan jujur.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowViolationModal(false)}
                className="w-full rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Modal */}
      {showModal && (
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="submitTitle">
          <div className="modal-panel">
            <h2 id="submitTitle" className="text-2xl font-extrabold text-slate-950">
              Submit Ujian Final?
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Setelah submit, jawaban tidak bisa diubah lagi.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-emerald-50 p-4">
                <p className="text-xs font-bold text-emerald-700">Dijawab</p>
                <p className="text-2xl font-extrabold text-emerald-700">{answeredCount}</p>
              </div>
              <div className="rounded-xl bg-rose-50 p-4">
                <p className="text-xs font-bold text-rose-700">Belum</p>
                <p className="text-2xl font-extrabold text-rose-700">{emptyCount}</p>
              </div>
              <div className="rounded-xl bg-amber-50 p-4">
                <p className="text-xs font-bold text-amber-700">Ragu-ragu</p>
                <p className="text-2xl font-extrabold text-amber-700">{doubtfulCount}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={isSubmitting}
                className="btn-secondary"
              >
                Tinjau Ulang
              </button>
              <button
                type="button"
                onClick={() => void handleSubmitFinal()}
                disabled={isSubmitting}
                className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
              >
                {isSubmitting ? "Menyimpan..." : "Submit Final"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthGuard>
  );
}
