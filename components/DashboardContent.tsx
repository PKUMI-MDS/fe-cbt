"use client";

import { useMemo } from "react";
import Link from "next/link";
import { UserRound } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import {
  getActiveAttempt,
  getMyExamSessions,
  getMyProfile,
  getMyResults,
  getMyTestApprovals,
} from "@/lib/auth-api";
import type {
  ActiveAttemptResponse,
  AuthUser,
  ExamResult,
  ExamSessionRegistration,
  TestApproval,
} from "@/lib/types";

type DashboardState = {
  activeAttempt: ActiveAttemptResponse;
  approvals: TestApproval[];
  profile: AuthUser | null;
  registrations: ExamSessionRegistration[];
  results: ExamResult[];
};

function formatDateTime(date?: string | null, fallback?: string | null) {
  const value = date ?? fallback;
  if (!value) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: value.includes("T") ? "short" : undefined,
  }).format(new Date(value));
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

export default function DashboardContent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const [profile, approvals, registrations, activeAttempt, results] = await Promise.all([
        getMyProfile(),
        getMyTestApprovals(),
        getMyExamSessions(),
        getActiveAttempt(),
        getMyResults(),
      ]);

      return {
        activeAttempt,
        approvals: approvals.data ?? [],
        profile,
        registrations: registrations.data ?? [],
        results: results.data ?? [],
      };
    },
  });

  const activeApprovals = useMemo(
    () => data?.approvals.filter((approval) => approval.status === "active") ?? [],
    [data?.approvals]
  );

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="mt-8 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
        {error instanceof Error ? error.message : "Gagal memuat dashboard."}
      </div>
    );
  }

  if (!data) return null;

  return (
    <>
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="eyebrow">Dashboard Peserta</p>
          <h1 className="page-title">Halo, {data.profile?.name ?? "Peserta"}</h1>
          <p className="page-desc">
            Status akun kamu {statusText(data.profile?.account_status).toLowerCase()}.
            Cek sesi ujian, approval, dan riwayat hasil dari backend.
          </p>
        </div>
        <Link href="/profile" className="btn-secondary">
          <UserRound className="h-4 w-4" />
          Lihat Profil
        </Link>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          {data.activeAttempt ? (
            <div className="panel border border-emerald-200 bg-emerald-50/50">
              <span className="badge-success">Sedang Berjalan</span>
              <h2 className="mt-4 text-2xl font-extrabold text-slate-950">
                {data.activeAttempt.session.title}
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Lanjutkan dari soal nomor {data.activeAttempt.attempt.current_question_number ?? 1}.
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
            {data.registrations.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-5 text-sm leading-6 text-slate-500">
                Belum ada sesi ujian yang ditugaskan. Jika sudah membayar, upload bukti pembayaran dan tunggu approval admin.
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {data.registrations.map((registration) => {
                  const session = registration.exam_session;
                  const duration = session?.duration_minutes ?? session?.exam_package?.duration_minutes;

                  return (
                    <div key={registration.id} className="rounded-xl border border-slate-200 p-5">
                      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                        <div>
                          <span className="badge-brand">{session?.code ?? "Sesi"}</span>
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
                          <strong>{formatDateTime(session?.start_time, session?.session_date)}</strong>
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
                        ) : (
                          <Link href={`/exam/instruction?session_id=${session?.id ?? ""}`} className="btn-primary">
                            {registration.registration_status === "in_progress" ? "Lanjutkan Ujian" : "Mulai Ujian"}
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="panel animate-fade-in-up delay-100">
            <h2 className="text-lg font-extrabold text-slate-950">Riwayat Hasil</h2>
            {data.results.length === 0 ? (
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
                    {data.results.map((result) => (
                      <tr key={result.id}>
                        <td className="px-4 py-4 font-semibold">{result.exam_session?.title ?? "Ujian"}</td>
                        <td className="px-4 py-4">{formatDateTime(result.created_at)}</td>
                        <td className="px-4 py-4 font-bold text-emerald-700">
                          {result.published_at ? "Dipublikasi" : "Menunggu"}
                        </td>
                        <td className="px-4 py-4 font-bold">
                          {result.published_at && result.exam_session?.show_result_to_user
                            ? (result.total_score ?? "-")
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-2xl bg-slate-950 p-6 text-white shadow-soft animate-fade-in-up delay-200">
            <h3 className="text-lg font-extrabold">Approval Ujian</h3>
            <div className="mt-5 space-y-3 text-sm text-slate-300">
              <p>Approval aktif: {activeApprovals.length}</p>
              <p>Total approval: {data.approvals.length}</p>
              <p>Status akun: {statusText(data.profile?.account_status)}</p>
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
