"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { UserRound } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import Pagination from "@/components/Pagination";
import {
  getActiveAttempt,
  getMyExamSessions,
  getMyProfile,
  getMyResults,
  getMyTestApprovals,
} from "@/lib/auth-api";

function formatDateTime(date?: string | null, fallback?: string | null) {
  const value = date ?? fallback;
  if (!value) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: value.includes("T") ? "short" : undefined,
  }).format(new Date(value));
}

/**
 * Extract "HH:mm" dari berbagai format waktu:
 * - "HH:mm" atau "HH:mm:ss" → langsung ambil (format baru dari backend fix)
 * - ISO datetime string ("2026-12-05T01:30:00+00:00" atau "...Z") →
 *   Ambil HH:mm LANGSUNG dari string (tanpa konversi timezone!), karena
 *   waktu di DB disimpan sebagai WIB lokal, bukan UTC.
 */
function extractTime(val?: string | null): string {
  if (!val) return "";
  // Plain time: "01:30" or "01:30:00" — already correct WIB (new backend format)
  const plain = val.match(/^(\d{2}:\d{2})(?::\d{2})?$/);
  if (plain) return plain[1];
  // ISO datetime: "2026-12-05T01:30:00+00:00" or "...Z" or "...+07:00"
  // Extract HH:mm DIRECTLY from the string (position after 'T').
  // The stored value is local WIB time; the UTC label is incorrect (VPS bug).
  const isoMatch = val.match(/T(\d{2}:\d{2})/);
  if (isoMatch) return isoMatch[1];
  return val;
}

/**
 * Format jadwal sesi: tampilkan "13 Mei 2026, 00:38 – 00:50 WIB".
 * Handle format lama (ISO UTC dari VPS) dan format baru ("YYYY-MM-DD" + "HH:mm").
 */
function formatSessionSchedule(
  sessionDate?: string | null,
  startTime?: string | null,
  endTime?: string | null,
): string {
  if (!sessionDate && !startTime) return "-";

  let datePart = "";
  if (sessionDate) {
    // Plain "YYYY-MM-DD" — parse as local date (no UTC shift)
    const plainMatch = sessionDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (plainMatch) {
      const [, y, m, d] = plainMatch;
      datePart = new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(
        new Date(Number(y), Number(m) - 1, Number(d)),
      );
    } else {
      // Fallback: format as date in WIB
      try {
        datePart = new Intl.DateTimeFormat("id-ID", {
          dateStyle: "long",
          timeZone: "Asia/Jakarta",
        }).format(new Date(sessionDate));
      } catch { datePart = sessionDate; }
    }
  }

  const start = extractTime(startTime);
  const end = extractTime(endTime);

  if (!datePart && !start) return "-";
  if (!start) return datePart || "-";
  const timePart = end ? `${start} – ${end} WIB` : `${start} WIB`;
  return datePart ? `${datePart}, ${timePart}` : timePart;
}

/**
 * Hitung waktu akhir sesi sebagai Date object untuk perbandingan.
 * Menggunakan session_date + end_time (WIB).
 */
function getSessionEndTime(sessionDate?: string | null, endTime?: string | null): Date | null {
  if (!sessionDate || !endTime) return null;

  const dateMatch = sessionDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!dateMatch) return null;

  const time = extractTime(endTime);
  if (!time) return null;

  const [hours, minutes] = time.split(":").map(Number);
  // Parse sebagai waktu lokal (WIB) — karena data dari backend sudah WIB
  const date = new Date(Number(dateMatch[1]), Number(dateMatch[2]) - 1, Number(dateMatch[3]), hours, minutes);
  return date;
}

function statusText(status?: string | null) {
  const labels: Record<string, string> = {
    active: "Aktif",
    assigned: "Ditugaskan",
    pending: "Pending",
    completed: "Selesai",
    in_progress: "Sedang Berjalan",
    scheduled: "Terjadwal",
    published: "Dipublikasi",
    draft: "Draft",
  };

  return status ? labels[status] ?? status : "-";
}

const SESSIONS_PER_PAGE = 5;
const RESULTS_PER_PAGE = 5;

export default function DashboardContent() {
  const [sessionsPage, setSessionsPage] = useState(1);
  const [resultsPage, setResultsPage] = useState(1);

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: getMyProfile,
  });

  const { data: approvalsData } = useQuery({
    queryKey: ["test-approvals"],
    queryFn: getMyTestApprovals,
    refetchInterval: 30000,
  });

  const { data: sessionsData, isLoading: sessionsLoading } = useQuery({
    queryKey: ["exam-sessions", sessionsPage],
    queryFn: () => getMyExamSessions(sessionsPage, SESSIONS_PER_PAGE),
    refetchInterval: 30000,
  });

  const { data: activeAttempt } = useQuery({
    queryKey: ["active-attempt"],
    queryFn: getActiveAttempt,
    refetchInterval: 3000,
  });

  const { data: resultsData, isLoading: resultsLoading } = useQuery({
    queryKey: ["results", resultsPage],
    queryFn: () => getMyResults(resultsPage, RESULTS_PER_PAGE),
    refetchInterval: 30000,
  });

  const isLoading = sessionsLoading || resultsLoading;

  const activeApprovals = useMemo(
    () => approvalsData?.data?.filter((approval) => approval.status === "active") ?? [],
    [approvalsData]
  );

  // Filter: tampilkan hanya sesi dengan status published
  const visibleRegistrations = useMemo(() => {
    if (!sessionsData?.data) return [];

    return sessionsData.data.filter((registration) => {
      const session = registration.exam_session;
      if (!session) return false;

      return (session.status?.toLowerCase() ?? "") === "published";
    });
  }, [sessionsData]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const anyError =
    !profile || !sessionsData || !resultsData;

  if (anyError) {
    return (
      <div className="mt-8 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
        Gagal memuat dashboard.
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="eyebrow">Dashboard Peserta</p>
          <h1 className="page-title">Halo, {profile?.name ?? "Peserta"}</h1>
          <p className="page-desc">
            Status akun kamu {statusText(profile?.account_status).toLowerCase()}.
            Cek sesi ujian, approval, dan riwayat hasil ujian.
          </p>
        </div>
        <Link href="/profile" className="btn-secondary">
          <UserRound className="h-4 w-4" />
          Lihat Profil
        </Link>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          {activeAttempt ? (
            <div className="panel border border-emerald-200 bg-emerald-50/50">
              <span className="badge-success">Sedang Berjalan</span>
              <h2 className="mt-4 text-2xl font-extrabold text-slate-950">
                {activeAttempt.session.title}
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Lanjutkan dari soal nomor {activeAttempt.attempt.current_question_number ?? 1}.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href="/exam" className="btn-primary">
                  Lanjutkan Ujian
                </Link>
              </div>
            </div>
          ) : null}

          <div className="panel animate-fade-in-up">
            <h2 className="text-lg font-extrabold text-slate-950">Sesi Ujian</h2>
            {visibleRegistrations.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-5 text-sm leading-6 text-slate-500">
                Belum ada sesi ujian yang ditugaskan. Jika sudah membayar, upload bukti pembayaran dan tunggu approval admin.
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {visibleRegistrations.map((registration) => {
                  const session = registration.exam_session;
                  const duration = session?.duration_minutes ?? session?.exam_package?.duration_minutes;
                  const sessionEnd = getSessionEndTime(session?.session_date, session?.end_time);
                  const isExpired = sessionEnd ? sessionEnd < new Date() : false;

                  return (
                    <div key={registration.id} className={`rounded-xl border p-5 ${isExpired ? "border-slate-300 bg-slate-50 opacity-75" : "border-slate-200"}`}>
                      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="badge-brand">{session?.code ?? "Sesi"}</span>
                            {isExpired && (
                              <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-700">
                                Waktu Habis
                              </span>
                            )}
                          </div>
                          <h3 className="mt-3 text-xl font-extrabold text-slate-950">
                            {session?.title ?? "Sesi ujian"}
                          </h3>
                          <p className="mt-2 text-sm text-slate-500">
                            {session?.exam_package?.title ?? session?.description ?? "Detail paket akan tampil dari backend."}
                          </p>
                        </div>
                        <div className="rounded-xl bg-brand-50 p-4 text-center">
                          <p className="text-2xl font-extrabold text-brand-700">{duration ?? "-"}</p>
                          <p className="text-xs font-bold text-brand-900">Menit</p>
                        </div>
                      </div>
                      <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        <div className="info-box">
                          <small>Jadwal</small>
                          <strong>{formatSessionSchedule(session?.session_date, session?.start_time, session?.end_time)}</strong>
                        </div>
                        <div className="info-box">
                          <small>Status Sesi</small>
                          <strong>{statusText(session?.status)}</strong>
                        </div>
                        <div className="info-box">
                          <small>Status Peserta</small>
                          <strong>{statusText(registration.registration_status)}</strong>
                        </div>
                      </div>
                      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                        <Link href={`/exam/detail?session_id=${session?.id ?? ""}`} className="btn-secondary">
                          Detail Sesi
                        </Link>
                        {registration.registration_status === "completed" ? (
                          <Link href="/exam/history" className="btn-primary">
                            Lihat Hasil
                          </Link>
                        ) : isExpired ? (
                          <span className="inline-flex items-center rounded-xl bg-slate-200 px-5 py-3 text-sm font-bold text-slate-500 cursor-not-allowed">
                            Sesi Berakhir
                          </span>
                        ) : (
                          <Link href={`/exam/instruction?session_id=${session?.id ?? ""}`} className="btn-primary">
                            {registration.registration_status === "in_progress" ? "Lanjutkan Ujian" : "Mulai Ujian"}
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
                <Pagination
                  currentPage={sessionsData.current_page ?? 1}
                  lastPage={sessionsData.last_page ?? 1}
                  total={sessionsData.total ?? 0}
                  perPage={SESSIONS_PER_PAGE}
                  onPageChange={setSessionsPage}
                />
              </div>
            )}
          </div>

          <div className="panel animate-fade-in-up delay-100">
            <h2 className="text-lg font-extrabold text-slate-950">Riwayat Hasil</h2>
            {resultsData.data.length === 0 ? (
              <p className="mt-4 text-sm leading-6 text-slate-500">Belum ada hasil ujian.</p>
            ) : (
              <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Ujian</th>
                      <th className="px-4 py-3">Tanggal</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Skor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultsData.data.map((result) => (
                      <tr key={result.id}>
                        <td className="px-4 py-4 font-semibold">{result.exam_session?.title ?? "Ujian"}</td>
                        <td className="px-4 py-4">{formatDateTime(result.created_at)}</td>
                        <td className="px-4 py-4 font-bold text-emerald-700">
                          {result.published_at ? "Dipublikasi" : "Menunggu"}
                        </td>
                        <td className="px-4 py-4 font-bold">
                          {result.published_at && (result.show_result_to_user ?? result.exam_session?.show_result_to_user)
                            ? (result.total_score ?? "-")
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Pagination
                  currentPage={resultsData.current_page ?? 1}
                  lastPage={resultsData.last_page ?? 1}
                  total={resultsData.total ?? 0}
                  perPage={RESULTS_PER_PAGE}
                  onPageChange={setResultsPage}
                />
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-2xl bg-slate-950 p-6 text-white shadow-soft animate-fade-in-up delay-200">
            <h3 className="text-lg font-extrabold">Approval Ujian</h3>
            <div className="mt-5 space-y-3 text-sm text-slate-300">
              <p>Approval aktif: {activeApprovals.length}</p>
              <p>Total approval: {approvalsData?.data?.length ?? 0}</p>
              <p>Status akun: {statusText(profile?.account_status)}</p>
            </div>
          </div>
          <div className="panel animate-fade-in-up delay-300">
            <h3 className="font-extrabold text-slate-950">Butuh bantuan?</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Upload bukti pembayaran jika belum punya approval atau hubungi helpdesk jika sesi ujian tidak muncul.
            </p>
            <div className="mt-4 grid gap-3">
              <Link href="/payment-proof" className="w-full justify-center btn-secondary">
                Upload Bukti Pembayaran
              </Link>
              <Link href="/forgot-password" className="w-full justify-center btn-secondary">
                Contact Helpdesk
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
