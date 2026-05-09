export default function ProfileSkeleton() {
  return (
    <div className="mt-8 panel animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-xl bg-slate-200" />
        <div className="space-y-2">
          <div className="h-6 w-48 rounded bg-slate-200" />
          <div className="h-4 w-32 rounded bg-slate-200" />
        </div>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="h-20 rounded-xl bg-slate-200" />
        <div className="h-20 rounded-xl bg-slate-200" />
        <div className="h-20 rounded-xl bg-slate-200" />
        <div className="h-20 rounded-xl bg-slate-200" />
      </div>
    </div>
  );
}
