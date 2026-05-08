"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FlowNav from "@/components/FlowNav";
import Toast from "@/components/Toast";

export default function ExamInstructionPage() {
  const [agreed, setAgreed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState("");

  const handleStart = () => {
    if (!agreed) {
      setToast("Centang persetujuan instruksi dulu");
      return;
    }
    setShowModal(true);
  };

  return (
    <>
      <Header />
      <Toast message={toast} onHide={() => setToast("")} />
      <main id="main">
        <section className="page-wrap max-w-4xl">
          <div className="panel">
            <p className="eyebrow">Exam Instruction</p>
            <h1 className="page-title">Instruksi Sebelum Ujian</h1>
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
              <Link href="/exam/detail" className="btn-secondary">
                Kembali
              </Link>
              <button type="button" onClick={handleStart} className="btn-primary">
                Mulai Ujian
              </button>
            </div>
          </div>
        </section>
      </main>
      <FlowNav />
      <Footer />

      {/* Modal Konfirmasi */}
      {showModal && (
        <div
          className="modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="startTitle"
        >
          <div className="modal-panel">
            <h2 id="startTitle" className="text-2xl font-extrabold text-slate-950">
              Mulai Ujian Sekarang?
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Timer akan berjalan dan sistem akan membuat paket soal khusus
              untuk attempt kamu.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="info-box">
                <small>Durasi</small>
                <strong>120m</strong>
              </div>
              <div className="info-box">
                <small>Soal</small>
                <strong>90</strong>
              </div>
              <div className="info-box">
                <small>Audio</small>
                <strong>2x</strong>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="btn-secondary"
              >
                Batal
              </button>
              <Link href="/exam" className="btn-primary">
                Start Now
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
