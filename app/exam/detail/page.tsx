"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthGuard from "@/components/AuthGuard";
import { ApiError } from "@/lib/api";
import { getAllMyExamSessions } from "@/lib/auth-api";
import type { ExamSession, ExamSessionRegistration } from "@/lib/types";

/**
 * Format jadwal sesi ujian.
 * session_date: "YYYY-MM-DD" → diparse sebagai local date
 * start_time: "HH:mm" dari backend (waktu lokal WIB) → ditampilkan langsung
 */
function extractTime(val?: string | null): string {
  if (!val) return "";
  // Plain "HH:mm" or "HH:mm:ss" — new backend format, already WIB
  const plain = val.match(/^(\d{2}:\d{2})(?::\d{2})?$/);
  if (plain) return plain[1];
  // ISO datetime: extract HH:mm directly after 'T' (no TZ conversion).
  // Time is stored as local WIB; UTC label is a VPS timezone misconfiguration.
  const isoMatch = val.match(/T(\d{2}:\d{2})/);
  if (isoMatch) return isoMatch[1];
  return val;
}

function formatSessionSchedule(
  sessionDate?: string | null,
  startTime?: string | null,
  endTime?: string | null,
): string {
  if (!sessionDate && !startTime) return "-";
  let datePart = "";
  if (sessionDate) {
    const m = sessionDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) {
      datePart = new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(
        new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])),
      );
    } else {
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

export default function ExamDetailPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [registration, setRegistration] = useState<ExamSessionRegistration | null>(null);
  const [session, setSession] = useState<ExamSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDetail() {
      try {
        const res = await getAllMyExamSessions();
        const regs = res.data ?? [];
        const found = sessionId
          ? regs.find((r) => String(r.exam_session?.id) === sessionId)
          : regs[0];
        if (found) {
          setRegistration(found);
          setSession(found.exam_session ?? null);
        } else {
          setError("Sesi ujian tidak ditemukan.");
        }
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Gagal memuat detail sesi.");
      } finally {
        setIsLoading(false);
      }
    }
    void loadDetail();
  }, [sessionId]);

  const pkg = session?.exam_package;
  const duration = session?.duration_minutes ?? pkg?.duration_minutes;
  const backHref = "/dashboard";
  const instructionHref = sessionId
    ? `/exam/instruction?session_id=${sessionId}`
    : "/exam/instruction";

  return (
    <AuthGuard>
      <Header />
      <main id="main">
        <section className="page-wrap max-w-6xl">
          <Link href={backHref} className="btn-secondary mb-6">
            Kembali ke Dashboard
          </Link>

          {isLoading ? (
            <div className="panel mt-6 text-sm font-semibold text-slate-500">
              Memuat detail sesi ujian...
            </div>
          ) : error ? (
            <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {error}
            </div>
          ) : (
            <div className="panel mt-6">
              <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
                <div>
                  <span className="badge-brand">{session?.code ?? "Sesi"}</span>
                  <h1 className="mt-4 text-3xl font-extrabold text-slate-950">
                    {session?.title ?? "Detail Sesi Ujian"}
                  </h1>
                  <p className="mt-3 max-w-2xl text-slate-500">
                    {pkg?.description ?? session?.description ?? "Sistem akan membuat paket soal acak khusus untuk attempt kamu saat ujian dimulai."}
                  </p>
                </div>
                <Link href={instructionHref} className="btn-primary">
                  Baca Instruksi
                </Link>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="info-box">
                  <small>Paket Soal</small>
                  <strong className="text-xl">{pkg?.title ?? "-"}</strong>
                </div>
                <div className="info-box">
                  <small>Durasi</small>
                  <strong className="text-2xl">{duration ? `${duration}m` : "-"}</strong>
                </div>
                <div className="info-box">
                  <small>Jadwal</small>
                  <strong>{formatSessionSchedule(session?.session_date, session?.start_time, session?.end_time)}</strong>
                </div>
                <div className="info-box">
                  <small>Status Sesi</small>
                  <strong className={session?.status === "published" ? "text-emerald-700" : "text-amber-700"}>
                    {session?.status ?? "-"}
                  </strong>
                </div>
              </div>

              <div className="mt-8 grid gap-5 lg:grid-cols-3">
                <div className="mini-card">
                  <h3>Listening</h3>
                  <p>Audio player dibatasi, tidak bisa seek, dan play count tercatat.</p>
                </div>
                <div className="mini-card">
                  <h3>Structure</h3>
                  <p>Pilihan ganda dengan navigasi cepat dan autosave.</p>
                </div>
                <div className="mini-card">
                  <h3>Reading / Arabic</h3>
                  <p>Mendukung teks Arab RTL, image, dan paragraf panjang.</p>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-4">
                <span className={`rounded-full px-4 py-2 text-xs font-bold ${registration?.registration_status === "assigned" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                  Status peserta: {registration?.registration_status ?? "-"}
                </span>
              </div>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </AuthGuard>
  );
}
