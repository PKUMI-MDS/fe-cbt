"use client";

interface SubmitExamModalProps {
  answeredCount: number;
  emptyCount: number;
  doubtfulCount: number;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function SubmitExamModal({
  answeredCount,
  emptyCount,
  doubtfulCount,
  isSubmitting,
  onCancel,
  onConfirm,
}: SubmitExamModalProps) {
  return (
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
            onClick={onCancel}
            disabled={isSubmitting}
            className="btn-secondary"
          >
            Tinjau Ulang
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {isSubmitting ? "Menyimpan..." : "Submit Final"}
          </button>
        </div>
      </div>
    </div>
  );
}
