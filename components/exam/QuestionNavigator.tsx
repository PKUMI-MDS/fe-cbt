"use client";

interface QuestionNavigatorProps {
  totalQuestions: number;
  currentNumber: number;
  answeredMap: Record<number, number | null>;
  doubtfulSet: Set<number>;
  onNavigate: (n: number) => void;
}

export default function QuestionNavigator({
  totalQuestions,
  currentNumber,
  answeredMap,
  doubtfulSet,
  onNavigate,
}: QuestionNavigatorProps) {
  return (
    <aside className="lg:sticky lg:top-24 lg:h-fit animate-fade-in-up delay-100">
      <div className="panel">
        <h3 className="font-extrabold text-slate-950">Navigasi Soal</h3>
        <div className="mt-5 grid grid-cols-6 gap-2">
          {Array.from({ length: totalQuestions }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              aria-label={`Buka soal ${n}`}
              aria-current={n === currentNumber ? "step" : undefined}
              onClick={() => onNavigate(n)}
              className={`h-10 rounded-xl text-xs font-extrabold transition focus:outline-none focus:ring-4 focus:ring-brand-400 ${
                n === currentNumber
                  ? "bg-brand-600 text-white shadow-md"
                  : doubtfulSet.has(n)
                  ? "bg-amber-400 text-amber-950 shadow-sm"
                  : answeredMap[n]
                  ? "bg-emerald-500 text-white shadow-sm"
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
  );
}
