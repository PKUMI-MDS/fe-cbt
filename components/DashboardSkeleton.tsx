export default function DashboardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div className="space-y-3">
          <div className="h-4 w-32 rounded bg-slate-200" />
          <div className="h-8 w-64 rounded bg-slate-200" />
          <div className="h-4 w-96 rounded bg-slate-200" />
        </div>
        <div className="h-10 w-32 rounded bg-slate-200" />
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          {/* Main sections skeleton */}
          <div className="h-48 rounded-xl bg-slate-200" />
          <div className="h-64 rounded-xl bg-slate-200" />
        </div>
        <aside className="space-y-5">
          {/* Sidebar sections skeleton */}
          <div className="h-40 rounded-2xl bg-slate-200" />
          <div className="h-32 rounded-xl bg-slate-200" />
        </aside>
      </div>
    </div>
  );
}
