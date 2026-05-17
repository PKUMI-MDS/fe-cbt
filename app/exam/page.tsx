"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Toast from "@/components/Toast";
import AuthGuard from "@/components/AuthGuard";
import ExamHeader from "@/components/exam/ExamHeader";
import QuestionPanel from "@/components/exam/QuestionPanel";
import QuestionNavigator from "@/components/exam/QuestionNavigator";
import SubmitExamModal from "@/components/exam/SubmitExamModal";
import ViolationModal from "@/components/exam/ViolationModal";
import { ApiError } from "@/lib/api";
import {
  getActiveAttempt,
  getExamSettings,
  getQuestion,
  logAudioPlay,
  logViolation,
  markDoubtful,
  navigateQuestion,
  saveAnswer,
  sendHeartbeat,
  submitExam,
} from "@/lib/auth-api";
import type { AttemptResult, ExamSettings, Question, ViolationPayload } from "@/lib/types";
import ExamSkeleton from "@/components/ExamSkeleton";

const HEARTBEAT_INTERVAL_MS = 30_000;

const DEFAULT_EXAM_SETTINGS: ExamSettings = {
  auto_submit_on_violation_limit: true,
  max_tab_switch: 3,
  max_fullscreen_exit: 3,
  shuffle_questions: true,
  shuffle_options: true,
  show_result_to_user: true,
};

function formatTime(seconds: number) {
  if (seconds <= 0) return "00:00:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

export default function ExamPage() {
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
  const [violationMessage, setViolationMessage] = useState("");
  const [examSettings, setExamSettings] = useState<ExamSettings>(DEFAULT_EXAM_SETTINGS);
  const isAutoSubmittingRef = useRef(false);
  const violationCountRef = useRef(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const beforeUnloadRef = useRef<((e: BeforeUnloadEvent) => void) | null>(null);

  // Load attempt on mount
  useEffect(() => {
    async function initExam() {
      try {
        let id: number | null = attemptIdParam ? Number(attemptIdParam) : null;
        let initialQuestionNumber = 1;

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
          initialQuestionNumber = active.attempt.current_question_number ?? 1;
          setCurrentNumber(initialQuestionNumber);
        } else {
          // attempt_id dari URL: WAJIB fetch remaining_seconds dari backend
          // agar timer tidak mulai dari 0 dan langsung auto-submit!
          try {
            const active = await getActiveAttempt();
            if (active && active.attempt.id === id) {
              setRemainingSeconds(active.attempt.remaining_seconds ?? 1800);
              setTotalQuestions(active.attempt.total_questions ?? 0);
              initialQuestionNumber = active.attempt.current_question_number ?? 1;
              setCurrentNumber(initialQuestionNumber);
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
        const q = await getQuestion(id, initialQuestionNumber);
        setCurrentQ(q);
        if (q.total) setTotalQuestions(q.total);

        // Restore answered from question's selected_option_id
        if (q.selected_option_id) {
          setAnsweredMap((prev) => ({ ...prev, [initialQuestionNumber]: q.selected_option_id! }));
        }
        if (q.is_doubtful) {
          setDoubtfulSet((prev) => new Set(prev).add(initialQuestionNumber));
        }

        // Load exam settings (dynamic limits, auto-submit, etc.)
        try {
          const settings = await getExamSettings();
          setExamSettings(settings);
        } catch {
          // fallback ke DEFAULT_EXAM_SETTINGS yang sudah di-set di initial state
        }
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Gagal memuat soal ujian.");
      } finally {
        setIsLoading(false);
      }
    }
    void initExam();
  }, [attemptIdParam]);

  // Heartbeat
  useEffect(() => {
    if (!attemptId || isLoading) return;
    heartbeatRef.current = setInterval(async () => {
      try {
        const hb = await sendHeartbeat(attemptId);
        setRemainingSeconds(hb.remaining_seconds);
        // "expired" adalah nilai enum backend untuk timeout, "submitted" untuk submit manual
        if (hb.status === "submitted" || hb.status === "expired" || hb.status === "auto_submitted" || hb.status === "timeout") {
          window.location.href = "/exam/completed";
        }
      } catch {
        // silent fail
      }
    }, HEARTBEAT_INTERVAL_MS);
    return () => clearInterval(heartbeatRef.current!);
  }, [attemptId, isLoading]);

  const handleSubmitFinal = useCallback(
    async (autoSubmit = false) => {
      if (!attemptId) return;
      setIsSubmitting(true);

      // Hapus beforeunload listener agar tidak muncul dialog "Leave page"
      if (beforeUnloadRef.current) {
        window.removeEventListener("beforeunload", beforeUnloadRef.current);
        beforeUnloadRef.current = null;
      }
      window.onbeforeunload = null;

      // Keluar fullscreen jika masih aktif
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }

      try {
        const result = await submitExam(attemptId);
        setSubmitResult(result);
        clearInterval(timerRef.current!);
        clearInterval(heartbeatRef.current!);

        if (autoSubmit) {
          window.location.href = "/dashboard";
        } else {
          window.location.href = `/exam/completed?attempt_id=${attemptId}&show_result=${result.show_result ?? false}`;
        }
      } catch {
        clearInterval(timerRef.current!);
        clearInterval(heartbeatRef.current!);
        window.location.href = autoSubmit ? "/dashboard" : "/dashboard";
      }
    },
    [attemptId]
  );

  const handleViolation = useCallback(
    async (type: ViolationPayload["violation_type"], detail: string) => {
      if (!attemptId || isAutoSubmittingRef.current) return;

      // Log ke backend — cek apakah backend sudah auto-submit
      try {
        const response = await logViolation(attemptId, { violation_type: type, severity: "medium", detail });
        // Backend bisa auto-submit jika threshold tercapai di sisi server
        const raw = response as unknown as Record<string, unknown>;
        if (raw?.auto_submitted === true) {
          isAutoSubmittingRef.current = true;
          setViolationMessage("Batas pelanggaran tercapai. Ujian disubmit otomatis oleh sistem.");
          setShowViolationModal(true);
          if (beforeUnloadRef.current) window.removeEventListener("beforeunload", beforeUnloadRef.current);
          window.onbeforeunload = null;
          if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
          setTimeout(() => { window.location.href = "/dashboard"; }, 1500);
          return;
        }
      } catch {
        // silent fail
      }

      // Increment violation count (gunakan ref untuk nilai real-time, state untuk render)
      violationCountRef.current += 1;
      const currentCount = violationCountRef.current;
      setViolationCount(currentCount);

      const maxViolations = examSettings.max_tab_switch; // total max pelanggaran
      const remaining = maxViolations - currentCount;

      // Sudah mencapai limit → LANGSUNG auto-submit tanpa delay
      if (currentCount >= maxViolations && examSettings.auto_submit_on_violation_limit) {
        isAutoSubmittingRef.current = true;
        setViolationMessage(`Batas pelanggaran tercapai (${maxViolations}x). Ujian disubmit otomatis.`);
        setShowViolationModal(true);
        // Submit langsung — tidak ada ampun
        void handleSubmitFinal(true);
        return;
      }

      // Peringatan terakhir (1 kesempatan lagi)
      if (remaining === 1) {
        setViolationMessage(
          `⚠️ PERINGATAN TERAKHIR! Anda sudah melakukan ${currentCount} pelanggaran dari ${maxViolations} yang diizinkan. Satu pelanggaran lagi, ujian akan OTOMATIS DISUBMIT!`
        );
        setShowViolationModal(true);
      }

      setToast(`Peringatan: ${detail}. Pelanggaran ${currentCount}/${maxViolations}. Jangan diulangi!`);
    },
    [attemptId, examSettings, handleSubmitFinal]
  );

  // Anti-cheat & Route Guard — MAXIMUM PROTECTION
  useEffect(() => {
    if (!attemptId || isLoading || error) return;

    // 1. Route guard (prevent refresh / leave)
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
      return "";
    };
    beforeUnloadRef.current = handleBeforeUnload;

    // 2. Fullscreen change — keluar fullscreen = pelanggaran
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullScreen(false);
        handleViolation("fullscreen_exit", "Peserta keluar dari mode fullscreen");
      } else {
        setIsFullScreen(true);
      }
    };

    // 3. Tab switch (visibility change) — pindah tab = pelanggaran
    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleViolation("tab_switch", "Peserta berpindah tab atau meminimalkan browser");
      }
    };

    // 4. Window blur — deteksi klik ke window/monitor lain (dual monitor)
    const handleWindowBlur = () => {
      // Hanya trigger jika document tidak hidden (artinya user klik ke window lain, bukan tab switch)
      // Ini menangkap kasus dual monitor dimana visibilitychange tidak fire
      if (!document.hidden) {
        handleViolation("tab_switch", "Peserta berpindah ke jendela atau monitor lain");
      }
    };

    // 5. Disable right click/copy/paste/select
    const preventAction = (e: Event) => {
      e.preventDefault();
    };

    // 6. Disable keyboard shortcuts (Ctrl+C, Ctrl+V, Ctrl+Tab, Alt+Tab info, F12, dll)
    const handleKeyDown = (e: KeyboardEvent) => {
      // Block: Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A, Ctrl+P, Ctrl+S, Ctrl+U
      if (e.ctrlKey && ["c", "v", "x", "a", "p", "s", "u"].includes(e.key.toLowerCase())) {
        e.preventDefault();
        return;
      }
      // Block: F12 (DevTools), Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
      if (e.key === "F12") {
        e.preventDefault();
        return;
      }
      if (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(e.key.toLowerCase())) {
        e.preventDefault();
        return;
      }
      // Block: Alt+Tab notification (can't actually block, but detect)
      // Block: PrintScreen
      if (e.key === "PrintScreen") {
        e.preventDefault();
        handleViolation("tab_switch", "Peserta mencoba mengambil screenshot");
      }
    };

    // 7. Detect DevTools open (resize trick)
    const devToolsCheck = setInterval(() => {
      const widthThreshold = window.outerWidth - window.innerWidth > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 160;
      if (widthThreshold || heightThreshold) {
        handleViolation("tab_switch", "Terdeteksi Developer Tools terbuka");
      }
    }, 2000);

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("contextmenu", preventAction);
    document.addEventListener("copy", preventAction);
    document.addEventListener("cut", preventAction);
    document.addEventListener("paste", preventAction);
    document.addEventListener("selectstart", preventAction);

    // Initial check
    if (document.fullscreenElement) {
      setIsFullScreen(true);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("contextmenu", preventAction);
      document.removeEventListener("copy", preventAction);
      document.removeEventListener("cut", preventAction);
      document.removeEventListener("paste", preventAction);
      document.removeEventListener("selectstart", preventAction);
      clearInterval(devToolsCheck);
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

  const handlePlayAudio = useCallback(async (audioRef: React.RefObject<HTMLAudioElement | null>) => {
    if (!attemptId || !currentQ) return;
    if (!currentQ.question_id) {
      setToast("Gagal memutar audio: ID soal tidak tersedia dari server.");
      return;
    }

    const audio = audioRef.current;
    if (!audio) {
      setToast("Audio soal belum siap dimuat.");
      return;
    }

    if ((currentQ.audio_play_count ?? 0) >= (currentQ.audio_max_play ?? 1)) {
      setToast(`Batas putar audio (${currentQ.audio_max_play ?? 1}x) sudah tercapai`);
      return;
    }

    try {
      audio.currentTime = 0;
      const playPromise = audio.play();
      void playPromise.catch(() => undefined);
      const result = await logAudioPlay(attemptId, currentQ.question_id);
      if (!result.allowed) {
        audio.pause();
        audio.currentTime = 0;
        setToast(`Batas putar audio (${result.max_play}x) sudah tercapai`);
        return;
      }
      // Update play count on current question
      setCurrentQ((prev) =>
        prev ? { ...prev, audio_play_count: result.play_count } : prev
      );
      await playPromise;
    } catch {
      audio.pause();
      setToast("Gagal memutar audio.");
    }
  }, [attemptId, currentQ]);

  const hasActiveTimer = remainingSeconds > 0;

  // Timer countdown: start only after backend remaining_seconds has been loaded.
  useEffect(() => {
    if (!attemptId || isLoading || !hasActiveTimer) return;

    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          void handleSubmitFinal(true);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [attemptId, isLoading, hasActiveTimer, handleSubmitFinal]);

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
        <ExamHeader
          currentQuestion={currentQ}
          currentNumber={currentNumber}
          totalQuestions={totalQuestions}
          remainingTime={formatTime(remainingSeconds)}
          remainingSeconds={remainingSeconds}
          saveState={saveState}
          onOpenSubmit={() => setShowModal(true)}
        />

        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_320px] lg:px-8">
          {/* Question Panel */}
          {currentQ && (
            <QuestionPanel
              currentQ={currentQ}
              currentNumber={currentNumber}
              totalQuestions={totalQuestions}
              selectedOptionId={selectedOptionId}
              doubtfulSet={doubtfulSet}
              onSelectAnswer={(optionId) => void handleSelectAnswer(optionId)}
              onDoubtful={() => void handleDoubtful()}
              onPrev={() => void (currentNumber > 1 && goToQuestion(currentNumber - 1))}
              onNext={() => void (currentNumber < totalQuestions && goToQuestion(currentNumber + 1))}
              onPlayAudio={(audioRef) => void handlePlayAudio(audioRef)}
              onImageError={() => setToast("Gagal memuat gambar soal. URL mungkin sudah expired.")}
              onAudioError={() => setToast("Gagal memuat audio soal. URL audio tidak bisa diakses.")}
            />
          )}

          {/* Question Navigator */}
          <QuestionNavigator
            totalQuestions={totalQuestions}
            currentNumber={currentNumber}
            answeredMap={answeredMap}
            doubtfulSet={doubtfulSet}
            onNavigate={(n) => void goToQuestion(n)}
          />
        </div>
      </section>

      {/* Violation Modal */}
      {showViolationModal && (
        <ViolationModal
          violationCount={violationCount}
          violationMessage={violationMessage}
          examSettings={examSettings}
          onDismiss={() => setShowViolationModal(false)}
        />
      )}

      {/* Submit Modal */}
      {showModal && (
        <SubmitExamModal
          answeredCount={answeredCount}
          emptyCount={emptyCount}
          doubtfulCount={doubtfulCount}
          isSubmitting={isSubmitting}
          onCancel={() => setShowModal(false)}
          onConfirm={() => void handleSubmitFinal()}
        />
      )}
    </AuthGuard>
  );
}
