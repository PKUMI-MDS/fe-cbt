import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FlowNav from "@/components/FlowNav";
import AuthGuard from "@/components/AuthGuard";

export const metadata = { title: "CAT/CBT TOAFL - Detail Ujian" };

export default function ExamDetailPage() {
  return (
    <AuthGuard>
      <Header />
      <main id="main">
        <section className="page-wrap max-w-6xl">
          <Link href="/dashboard" className="btn-secondary mb-6">
            Kembali ke Dashboard
          </Link>
          <div className="panel mt-6">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
              <div>
                <span className="badge-brand">TOAFL</span>
                <h1 className="mt-4 text-3xl font-extrabold text-slate-950">
                  TOAFL Online Test - Paket Hari Ini
                </h1>
                <p className="mt-3 max-w-2xl text-slate-500">
                  Sistem akan membuat paket soal acak khusus untuk attempt kamu
                  saat ujian dimulai.
                </p>
              </div>
              <Link href="/exam/instruction" className="btn-primary">
                Baca Instruksi
              </Link>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="info-box">
                <small>Jumlah Soal</small>
                <strong className="text-2xl">90</strong>
              </div>
              <div className="info-box">
                <small>Durasi</small>
                <strong className="text-2xl">120m</strong>
              </div>
              <div className="info-box">
                <small>Audio</small>
                <strong className="text-2xl">2x</strong>
              </div>
              <div className="info-box">
                <small>Timer</small>
                <strong className="text-2xl text-emerald-700">On</strong>
              </div>
            </div>

            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              <div className="mini-card">
                <h3>Listening</h3>
                <p>
                  Audio player dibatasi, tidak bisa seek, dan play count
                  tercatat.
                </p>
              </div>
              <div className="mini-card">
                <h3>Structure</h3>
                <p>Pilihan ganda dengan navigasi cepat dan autosave.</p>
              </div>
              <div className="mini-card">
                <h3>Reading / Arabic</h3>
                <p>
                  Mendukung teks Arab RTL, image, dan paragraf panjang.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <FlowNav />
      <Footer />
    </AuthGuard>
  );
}
