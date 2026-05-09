export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
        <p className="mt-3 text-sm font-semibold text-slate-500">Memuat...</p>
      </div>
    </div>
  );
}
