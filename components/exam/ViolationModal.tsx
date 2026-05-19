"use client";

import type { ExamSettings } from "@/lib/types";

interface ViolationModalProps {
  violationCount: number;
  violationMessage: string;
  examSettings: ExamSettings;
  onDismiss: () => void;
}

export default function ViolationModal({
  violationCount,
  violationMessage,
  examSettings,
  onDismiss,
}: ViolationModalProps) {
  const isAutoSubmitted = violationCount >= examSettings.max_tab_switch;

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="violationTitle">
      <div className="modal-panel max-w-sm text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
          <span className="text-3xl">🚨</span>
        </div>
        <h2 id="violationTitle" className="text-2xl font-extrabold text-rose-700">
          {isAutoSubmitted ? "UJIAN DISUBMIT OTOMATIS" : "PERINGATAN TERAKHIR"}
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {violationMessage}
        </p>
        <div className="mt-4 rounded-xl bg-rose-50 p-3">
          <p className="text-xs font-bold text-rose-700">
            Pelanggaran: {violationCount} / {examSettings.max_tab_switch}
          </p>
        </div>
        {!isAutoSubmitted && (
          <div className="mt-6">
            <button
              type="button"
              onClick={onDismiss}
              className="w-full rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white"
            >
              Saya Mengerti, Tidak Akan Mengulangi
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
