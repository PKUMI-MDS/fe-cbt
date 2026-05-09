export default function ExamSkeleton() {
  return (
    <div className="min-h-screen bg-slate-100 animate-pulse">
      {/* Header Skeleton */}
      <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="space-y-2">
            <div className="h-3 w-16 rounded bg-slate-200" />
            <div className="h-5 w-32 rounded bg-slate-200" />
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden h-6 w-16 rounded-full bg-slate-200 sm:block" />
            <div className="h-9 w-24 rounded-xl bg-slate-200" />
            <div className="h-9 w-20 rounded-xl bg-slate-200" />
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_320px] lg:px-8">
        {/* Main Content Skeleton */}
        <div className="space-y-5">
          <div className="panel">
            <div className="mb-5 flex gap-2">
              <div className="h-6 w-16 rounded-full bg-slate-200" />
              <div className="h-6 w-24 rounded-full bg-slate-200" />
            </div>
            
            {/* Stem Skeleton */}
            <div className="space-y-3">
              <div className="h-4 w-full rounded bg-slate-200" />
              <div className="h-4 w-5/6 rounded bg-slate-200" />
              <div className="h-4 w-4/6 rounded bg-slate-200" />
            </div>

            {/* Options Skeleton */}
            <div className="mt-7 space-y-3">
              <div className="h-14 rounded-xl bg-slate-200" />
              <div className="h-14 rounded-xl bg-slate-200" />
              <div className="h-14 rounded-xl bg-slate-200" />
              <div className="h-14 rounded-xl bg-slate-200" />
            </div>
          </div>

          {/* Navigation Skeleton */}
          <div className="flex flex-col justify-between gap-3 sm:flex-row">
            <div className="h-12 w-40 rounded-xl bg-slate-200" />
            <div className="flex gap-3">
              <div className="h-12 w-40 rounded-xl bg-slate-200" />
              <div className="h-12 w-40 rounded-xl bg-slate-200" />
            </div>
          </div>
        </div>

        {/* Navigator Sidebar Skeleton */}
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="panel">
            <div className="h-5 w-32 rounded bg-slate-200" />
            <div className="mt-5 grid grid-cols-6 gap-2">
              {Array.from({ length: 30 }).map((_, i) => (
                <div key={i} className="h-10 rounded-xl bg-slate-200" />
              ))}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="h-4 w-20 rounded bg-slate-200" />
              <div className="h-4 w-20 rounded bg-slate-200" />
              <div className="h-4 w-20 rounded bg-slate-200" />
              <div className="h-4 w-20 rounded bg-slate-200" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
