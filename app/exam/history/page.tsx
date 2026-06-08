"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { BookOpen, ListFilter } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthGuard from "@/components/AuthGuard";
import { getMyResults } from "@/lib/auth-api";
import HistorySkeleton from "@/components/HistorySkeleton";
import Pagination from "@/components/Pagination";

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(value));
}

const PER_PAGE_OPTIONS = [5, 10, 20, 50];

export default function ExamHistoryPage() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const { data, isLoading, error } = useQuery({
    queryKey: ["history", page, perPage],
    queryFn: () => getMyResults(page, perPage),
  });

  const results = data?.data ?? [];

  return (
    <AuthGuard>
      <Header />
      <main id="main">
        <section className="page-wrap max-w-6xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="page-title">Riwayat Ujian</h1>
              <p className="page-desc">Daftar ujian yang pernah kamu ikuti.</p>
            </div>
            <div className="flex items-center gap-2">
              <ListFilter className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-xs text-slate-500">Tampilkan</span>
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setPage(1);
                }}
                className="h-7 rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 outline-none focus:border-brand-400"
              >
                {PER_PAGE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>

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
            <>
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
                          <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
                              <BookOpen className="h-4 w-4" />
                            </div>
                            {result.exam_session?.title ?? "Ujian"}
                          </div>
                        </td>
                        <td className="px-6 py-5">{formatDate(result.created_at)}</td>
                        <td className="px-6 py-5 font-bold text-emerald-700">
                          {result.published_at ? "Dipublikasi" : "Menunggu"}
                        </td>
                        <td className="px-6 py-5 font-bold">
                          {result.published_at && (result.show_result_to_user ?? result.exam_session?.show_result_to_user) && result.total_score != null
                            ? String(result.total_score)
                            : "-"}
                        </td>
                        <td className="px-6 py-5">
                          {result.published_at && (result.show_result_to_user ?? result.exam_session?.show_result_to_user) ? (
                            <Link
                              href={`/exam/score?attempt_id=${result.exam_attempt_id ?? result.id}`}
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
              <div className="mt-4">
                <Pagination
                  currentPage={data?.current_page ?? 1}
                  lastPage={data?.last_page ?? 1}
                  total={data?.total ?? 0}
                  perPage={perPage}
                  onPageChange={setPage}
                />
              </div>
            </>
          )}
        </section>
      </main>
      <Footer />
    </AuthGuard>
  );
}
