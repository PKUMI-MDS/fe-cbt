import Link from "next/link";

export const metadata = { title: "Halaman Tidak Ditemukan - CAT/CBT TOAFL" };

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-slate-950">404</h2>
        <p className="mt-2 text-lg font-semibold text-slate-700">
          Halaman tidak ditemukan
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Halaman yang Anda cari mungkin telah dipindahkan atau dihapus.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Ke Dashboard
        </Link>
      </div>
    </div>
  );
}
