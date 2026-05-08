"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Play } from "lucide-react";
import Toast from "@/components/Toast";
import AuthGuard from "@/components/AuthGuard";

const TOTAL_QUESTIONS = 90;
const INITIAL_ANSWERED = new Set([2, 4, 8, 12, 15, 20, 21, 30]);
const INITIAL_DOUBTFUL = new Set([5, 12, 44]);

export default function ExamPage() {
  const [currentQ, setCurrentQ] = useState(1);
  const [answered, setAnswered] = useState<Set<number>>(new Set(INITIAL_ANSWERED));
  const [doubtful, setDoubtful] = useState<Set<number>>(new Set(INITIAL_DOUBTFUL));
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [saveState, setSaveState] = useState("Saved");
  const [audioLeft, setAudioLeft] = useState(2);
  const [audioBarWidth, setAudioBarWidth] = useState("0%");
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState("");

  const goToQuestion = useCallback(
    (q: number) => {
      setCurrentQ(q);
      setSelectedAnswer(null);
    },
    []
  );

  const handleSelectAnswer = (idx: number) => {
    setSelectedAnswer(idx);
    setAnswered((prev) => new Set(prev).add(currentQ));
    setSaveState("Saving...");
    setTimeout(() => setSaveState("Saved"), 600);
  };

  const handlePlayAudio = () => {
    if (audioLeft <= 0) {
      setToast("Audio play limit reached");
      return;
    }
    const newLeft = audioLeft - 1;
    setAudioLeft(newLeft);
    setAudioBarWidth(newLeft === 1 ? "45%" : "100%");
  };

  const handleDoubtful = () => {
    setDoubtful((prev) => new Set(prev).add(currentQ));
    setToast("Question marked as doubtful");
  };

  const answeredCount = answered.size;
  const emptyCount = TOTAL_QUESTIONS - answeredCount;
  const doubtfulCount = doubtful.size;

  const answers = [
    "أ. في السوق",
    "ب. في المكتبة",
    "ج. في الفصل",
    "د. في البيت",
  ];

  return (
    <AuthGuard>
      <Toast message={toast} onHide={() => setToast("")} />

      <section className="min-h-screen bg-slate-100">
        {/* Sticky Header Ujian */}
        <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <div>
              <p className="text-xs font-bold uppercase text-slate-400">
                TOAFL Online Test
              </p>
              <h1 className="text-base font-extrabold text-slate-950">
                Question <span>{currentQ}</span> of {TOTAL_QUESTIONS}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 sm:inline-flex">
                {saveState}
              </span>
              <span className="rounded-xl bg-rose-50 px-4 py-2 font-mono text-sm font-extrabold text-rose-700">
                01:18:42
              </span>
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white"
              >
                Finish
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_320px] lg:px-8">
          {/* Main Content */}
          <div className="space-y-5 animate-fade-in-up">
            <div className="panel">
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className="badge-brand">Reading / Arabic</span>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                  Auto-save active
                </span>
              </div>

              <div className="space-y-4">
                <p className="arabic text-2xl font-semibold text-slate-950">
                  اقرأ النص الآتي ثم اختر الإجابة الصحيحة من الخيارات المتاحة.
                </p>
                <p className="arabic rounded-xl bg-slate-50 p-5 text-xl text-slate-700">
                  كانَ الطّالبُ يقرأُ كتابًا في المكتبةِ عندما سمعَ صوتَ
                  الأذانِ من المسجدِ القريبِ.
                </p>
              </div>

              {/* Audio Player */}
              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="mb-3 text-sm font-bold text-slate-700">
                  Audio sample component
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handlePlayAudio}
                    className={`grid h-11 w-11 place-items-center rounded-full text-white ${
                      audioLeft === 0 ? "bg-slate-300" : "bg-brand-600"
                    }`}
                    aria-label="Putar audio"
                  >
                    <Play className="h-4 w-4 fill-current" />
                  </button>
                  <div className="h-2 flex-1 rounded-full bg-slate-200">
                    <div
                      className="h-2 rounded-full bg-brand-600 transition-all"
                      style={{ width: audioBarWidth }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-500">
                    {audioLeft} plays left
                  </span>
                </div>
              </div>

              {/* Pilihan Jawaban */}
              <div className="mt-7 space-y-3">
                {answers.map((ans, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectAnswer(idx)}
                    className={`answer ${selectedAnswer === idx ? "selected" : ""}`}
                  >
                    <span className="arabic block text-xl">{ans}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Navigasi Soal */}
            <div className="flex flex-col justify-between gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => currentQ > 1 && goToQuestion(currentQ - 1)}
                className="btn-secondary"
              >
                Previous Question
              </button>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleDoubtful}
                  className="rounded-xl border border-amber-200 bg-amber-50 px-6 py-3 text-sm font-bold text-amber-700"
                >
                  Mark Doubtful
                </button>
                <button
                  type="button"
                  onClick={() =>
                    currentQ < TOTAL_QUESTIONS && goToQuestion(currentQ + 1)
                  }
                  className="btn-primary"
                >
                  Next Question
                </button>
              </div>
            </div>
          </div>

          {/* Question Navigator */}
          <aside className="lg:sticky lg:top-24 lg:h-fit animate-fade-in-up delay-100">
            <div className="panel">
              <h3 className="font-extrabold text-slate-950">
                Question Navigator
              </h3>
              <div className="mt-5 grid grid-cols-6 gap-2">
                {Array.from({ length: TOTAL_QUESTIONS }, (_, i) => i + 1).map(
                  (n) => (
                    <button
                      key={n}
                      type="button"
                      aria-label={`Buka soal ${n}`}
                      onClick={() => goToQuestion(n)}
                      className={`h-10 rounded-xl text-xs font-extrabold transition focus:outline-none focus:ring-4 focus:ring-brand-100 ${
                        n === currentQ
                          ? "bg-brand-600 text-white"
                          : doubtful.has(n)
                          ? "bg-amber-400 text-amber-950"
                          : answered.has(n)
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      {n}
                    </button>
                  )
                )}
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2 text-xs text-slate-500">
                <p>
                  <span className="mr-1 inline-block h-3 w-3 rounded bg-brand-600" />
                  Current
                </p>
                <p>
                  <span className="mr-1 inline-block h-3 w-3 rounded bg-emerald-500" />
                  Answered
                </p>
                <p>
                  <span className="mr-1 inline-block h-3 w-3 rounded bg-amber-400" />
                  Doubtful
                </p>
                <p>
                  <span className="mr-1 inline-block h-3 w-3 rounded bg-slate-200" />
                  Empty
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Submit Modal */}
      {showModal && (
        <div
          className="modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="submitTitle"
        >
          <div className="modal-panel">
            <h2
              id="submitTitle"
              className="text-2xl font-extrabold text-slate-950"
            >
              Submit Final?
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Setelah submit, jawaban tidak bisa diubah lagi.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-emerald-50 p-4">
                <p className="text-xs font-bold text-emerald-700">Answered</p>
                <p className="text-2xl font-extrabold text-emerald-700">
                  {answeredCount}
                </p>
              </div>
              <div className="rounded-xl bg-rose-50 p-4">
                <p className="text-xs font-bold text-rose-700">Empty</p>
                <p className="text-2xl font-extrabold text-rose-700">
                  {emptyCount}
                </p>
              </div>
              <div className="rounded-xl bg-amber-50 p-4">
                <p className="text-xs font-bold text-amber-700">Doubtful</p>
                <p className="text-2xl font-extrabold text-amber-700">
                  {doubtfulCount}
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="btn-secondary"
              >
                Review Answers
              </button>
              <Link
                href="/exam/completed"
                className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white"
              >
                Submit Final
              </Link>
            </div>
          </div>
        </div>
      )}
    </AuthGuard>
  );
}
