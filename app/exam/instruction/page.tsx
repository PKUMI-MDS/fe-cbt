"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Toast from "@/components/Toast";
import AuthGuard from "@/components/AuthGuard";
import DesktopOnlyGuard from "@/components/DesktopOnlyGuard";
import { ApiError } from "@/lib/api";
import { getActiveAttempt, startExam } from "@/lib/auth-api";
import { getMyExamSessions } from "@/lib/auth-api";
import type { ExamSession } from "@/lib/types";

export default function ExamInstructionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [agreed, setAgreed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState("");
  const [session, setSession] = useState<ExamSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load session info
  useEffect(() => {
    async function loadSession() {
      try {
        const res = await getMyExamSessions();
        const regs = res.data ?? [];
        const found = sessionId
          ? regs.find((r) => String(r.exam_session?.id) === sessionId)
          : regs[0];
        setSession(found?.exam_session ?? null);
      } catch {
        // session info optional, ujian tetap bisa dimulai
      } finally {
        setIsLoading(false);
      }
    }
    void loadSession();
  }, [sessionId]);

  const handleStart = () => {
    setShowModal(true);
  };

  const handleConfirmStart = useCallback(async () => {
    setIsStarting(true);
    setError("");

    try {
      // Cek dulu apakah ada active attempt (resume flow)
      const activeAttempt = await getActiveAttempt();

      if (activeAttempt) {
        // Resume: langsung ke halaman ujian dengan attempt yang ada
        router.push(`/exam?attempt_id=${activeAttempt.attempt.id}`);
        return;
      }

      // Mulai baru: butuh session_id
      if (!sessionId) {
        setError("Session ID tidak ditemukan. Kembali ke dashboard dan pilih sesi ujian.");
        setShowModal(false);
        setIsStarting(false);
        return;
      }

      const result = await startExam(Number(sessionId));
      router.push(`/exam?attempt_id=${result.attempt.id}`);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Gagal memulai ujian.";
      setError(message);
      setShowModal(false);
      setIsStarting(false);
    }
  }, [router, sessionId]);

  const duration = session?.duration_minutes ?? session?.exam_package?.duration_minutes;
  const detailHref = sessionId ? `/exam/detail?session_id=${sessionId}` : "/exam/detail";

  return (
    <AuthGuard>
      <DesktopOnlyGuard>
      <Header />
      <Toast message={toast} onHide={() => setToast("")} />
      <main id="main">
        <section className="page-wrap max-w-4xl">
          <div className="panel">
            <p className="eyebrow">Exam Instruction</p>
            <h1 className="page-title">
              {isLoading ? "Memuat instruksi..." : `Instruksi — ${session?.title ?? "Ujian"}`}
            </h1>

            {error ? (
              <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                {error}
              </div>
            ) : null}

            <div className="mt-8 space-y-4">
              <div className="instruction">
                <h3>Aturan Umum</h3>
                <p>
                  Pastikan koneksi stabil. Jangan refresh, close browser, atau
                  membuka aplikasi lain selama ujian.
                </p>
              </div>
              <div className="instruction">
                <h3>Timer</h3>
                <p>
                  Timer berjalan setelah kamu klik mulai. Jika waktu habis,
                  sistem akan submit otomatis.
                  {duration ? ` Durasi ujian: ${duration} menit.` : ""}
                </p>
              </div>
              <div className="instruction">
                <h3>Audio</h3>
                <p>
                  Audio hanya bisa diputar sesuai batas yang ditentukan dan
                  tidak dapat dimaju/mundurkan.
                </p>
              </div>
              <div className="rounded-xl bg-rose-50 p-5">
                <h3 className="font-bold text-rose-800">Anti-Cheat</h3>
                <p className="mt-2 text-sm leading-6 text-rose-700">
                  Pindah tab, keluar fullscreen, atau login di device lain dapat
                  dicatat sebagai pelanggaran.
                </p>
              </div>
            </div>

            <label className="mt-6 flex items-start gap-3 rounded-xl border border-slate-200 p-4 text-sm font-semibold text-slate-700 cursor-pointer">
              <input
                id="agree"
                type="checkbox"
                className="mt-1 rounded"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              Saya sudah membaca dan memahami aturan ujian.
            </label>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <a href={detailHref} className="btn-secondary">
                Kembali
              </a>
              <button
                type="button"
                onClick={handleStart}
                disabled={!agreed}
                className={`btn-primary ${!agreed ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                Mulai Ujian
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      {/* Modal Konfirmasi Start */}
      {showModal && (
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="startTitle">
          <div className="modal-panel">
            <h2 id="startTitle" className="text-2xl font-extrabold text-slate-950">
              Mulai Ujian Sekarang?
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Timer akan berjalan dan sistem akan membuat paket soal khusus untuk attempt kamu.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="info-box">
                <small>Sesi</small>
                <strong>{session?.title ?? "-"}</strong>
              </div>
              <div className="info-box">
                <small>Durasi</small>
                <strong>{duration ? `${duration} menit` : "-"}</strong>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={isStarting}
                className="btn-secondary"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => void handleConfirmStart()}
                disabled={isStarting}
                className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isStarting ? "Memulai..." : "Start Sekarang"}
              </button>
            </div>
          </div>
        </div>
      )}
      </DesktopOnlyGuard>
    </AuthGuard>
  );
}
