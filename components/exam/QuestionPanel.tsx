"use client";

import { useRef } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import type { Question } from "@/lib/types";

interface QuestionPanelProps {
  currentQ: Question;
  currentNumber: number;
  totalQuestions: number;
  selectedOptionId: number | null;
  doubtfulSet: Set<number>;
  onSelectAnswer: (optionId: number) => void;
  onDoubtful: () => void;
  onPrev: () => void;
  onNext: () => void;
  onPlayAudio: (audioRef: React.RefObject<HTMLAudioElement | null>) => void;
  onImageError: () => void;
  onAudioError: () => void;
}

export default function QuestionPanel({
  currentQ,
  currentNumber,
  totalQuestions,
  selectedOptionId,
  doubtfulSet,
  onSelectAnswer,
  onDoubtful,
  onPrev,
  onNext,
  onPlayAudio,
  onImageError,
  onAudioError,
}: QuestionPanelProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div className="panel">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="badge-brand">{currentQ.section_type ?? "Soal"}</span>
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
            Auto-save aktif
          </span>
        </div>

        {/* Stem */}
        <div
          className="prose max-w-none text-slate-950"
          dangerouslySetInnerHTML={{ __html: currentQ.stem_html ?? "<p>Memuat soal...</p>" }}
        />

        {/* Image */}
        {currentQ.image_url ? (
          <div className="relative mt-4 h-72 w-full">
            <Image
              src={currentQ.image_url}
              alt="Gambar soal"
              fill
              className="rounded-xl object-contain"
              onError={onImageError}
              unoptimized
            />
          </div>
        ) : null}

        {/* Audio Player */}
        {currentQ.audio_url ? (
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-3 text-sm font-bold text-slate-700">
              Audio soal ({currentQ.audio_play_count ?? 0}/{currentQ.audio_max_play ?? 1}x dimainkan)
            </p>
            <audio
              ref={audioRef}
              src={currentQ.audio_url}
              preload="none"
              onError={onAudioError}
            />
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onPlayAudio(audioRef)}
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
          {(currentQ.options ?? []).map((opt) => (
            <label
              key={opt.id}
              className={`answer block cursor-pointer focus-within:outline-none focus-within:ring-4 focus-within:ring-brand-500 focus-within:border-brand-500 w-full text-left ${selectedOptionId === opt.id ? "selected" : ""}`}
            >
              <input
                type="radio"
                name={`question-${currentQ.id ?? currentNumber}`}
                value={opt.id}
                checked={selectedOptionId === opt.id}
                onChange={() => onSelectAnswer(opt.id)}
                className="sr-only"
              />
              <span
                className={`block ${currentQ.section_type?.includes("arabic") || currentQ.section?.includes("arabic") ? "arabic text-xl" : ""}`}
                dangerouslySetInnerHTML={{ __html: opt.option_html ?? "" }}
              />
            </label>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={onPrev}
          disabled={currentNumber <= 1}
          className="btn-secondary hidden sm:inline-flex disabled:opacity-40"
        >
          Soal Sebelumnya
        </button>

        {/* Mobile Prev/Next Grid */}
        <div className="grid grid-cols-2 gap-3 sm:hidden">
          <button
            type="button"
            onClick={onPrev}
            disabled={currentNumber <= 1}
            className="btn-secondary disabled:opacity-40"
          >
            Sebelumnya
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={currentNumber >= totalQuestions}
            className="btn-primary disabled:opacity-40"
          >
            Berikutnya
          </button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onDoubtful}
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
            onClick={onNext}
            disabled={currentNumber >= totalQuestions}
            className="btn-primary hidden sm:inline-flex disabled:opacity-40"
          >
            Soal Berikutnya
          </button>
        </div>
      </div>
    </div>
  );
}
