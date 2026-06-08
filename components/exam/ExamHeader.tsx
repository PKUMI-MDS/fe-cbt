"use client";

import type { Question } from "@/lib/types";

interface ExamHeaderProps {
  currentQuestion: Question | null;
  currentNumber: number;
  totalQuestions: number;
  remainingTime: string;
  remainingSeconds: number;
  saveState: "Saved" | "Saving..." | "Failed";
  onOpenSubmit: () => void;
}

export default function ExamHeader({
  currentQuestion,
  currentNumber,
  totalQuestions,
  remainingTime,
  remainingSeconds,
  saveState,
  onOpenSubmit,
}: ExamHeaderProps) {
  const isLowTime = remainingSeconds > 0 && remainingSeconds <= 300; // 5 menit

  return (
    <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs font-bold uppercase text-slate-400">
            {currentQuestion?.section_type ?? currentQuestion?.section ?? "Ujian"}
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
            className={`rounded-xl px-4 py-2 font-mono text-sm font-extrabold transition-colors ${
              isLowTime ? "bg-rose-50 text-rose-700 animate-pulse" : "bg-slate-100 text-slate-700"
            }`}
          >
            {remainingTime}
          </span>

        </div>
      </div>
    </div>
  );
}
