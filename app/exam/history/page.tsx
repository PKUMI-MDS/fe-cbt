"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthGuard from "@/components/AuthGuard";
import { getResultHistory } from "@/lib/auth-api";
import HistorySkeleton from "@/components/HistorySkeleton";

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(value));
}

export default function ExamHistoryPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["history"],
    queryFn: getResultHistory,
  });

  const results = data?.data ?? [];

  return (
    <AuthGuard>
      <Header />
      <main id="main">
        <section className="page-wrap max-w-6xl">
          <h1 className="page-title">Riwayat Ujian</h1>
          <p className="page-desc">Daftar ujian yang pernah kamu ikuti.</p>

          {isLoading ? (
            <HistorySkeleton />
          ) : error ? (
            <div className="mt-8 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {error instanceof Error ? error.message : "Gagal memuat riwayat ujian."}
            </div>
          ) : results.length === 0 ? (
            <div className="mt-8 rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm leading-6 text-slate-500">
              Belum ada riwayat ujian. Selesaikan ujian pertama kamu untuk melihat hasilnya di sini.
            </div>
          ) : (
            <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-soft">
              <table className="min-w-[760px] w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Ujian</th>
                    <th className="px-6 py-4">Tanggal</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Skor</th>
                    <th className="px-6 py-4">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, idx) => (
                    <tr
                      key={result.id}
                      className={idx > 0 ? "border-t border-slate-100" : ""}
                    >
                      <td className="px-6 py-5 font-bold">
                        {result.exam_session?.title ?? "Ujian"}
                      </td>
                      <td className="px-6 py-5">{formatDate(result.created_at)}</td>
                      <td className="px-6 py-5 font-bold text-emerald-700">
                        {result.published_at ? "Dipublikasi" : "Menunggu"}
                      </td>
                      <td className="px-6 py-5 font-bold">
                        {result.published_at && result.total_score != null
                          ? String(result.total_score)
                          : "-"}
                      </td>
                      <td className="px-6 py-5">
                        {result.published_at ? (
                          <Link
                            href={`/exam/score?result_id=${result.id}`}
                            className="rounded-xl bg-brand-50 px-4 py-2 font-bold text-brand-700 hover:bg-brand-100 transition"
                          >
                            Detail
                          </Link>
                        ) : (
                          <span className="text-slate-400 text-xs font-semibold">Belum tersedia</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </AuthGuard>
  );
}
