export default function HistorySkeleton() {
  return (
    <div className="mt-8 animate-pulse">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
        <div className="h-12 border-b border-slate-100 bg-slate-50" />
        <div className="space-y-4 p-6">
          <div className="h-6 rounded bg-slate-200 w-full" />
          <div className="h-6 rounded bg-slate-200 w-full" />
          <div className="h-6 rounded bg-slate-200 w-full" />
        </div>
      </div>
    </div>
  );
}
