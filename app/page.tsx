import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FlowNav from "@/components/FlowNav";
import {
  UserPlus,
  LogIn,
  ClipboardEdit,
  BadgeCheck,
  Shuffle,
  BarChart3,
  Play,
} from "lucide-react";

export const metadata = {
  title: "CAT/CBT TOAFL - Landing",
};

export default function HomePage() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-white focus:px-4 focus:py-3 focus:text-sm focus:font-bold focus:text-slate-950 focus:shadow-soft"
      >
        Lewati ke konten utama
      </a>
      <Header />
      <main id="main">
        {/* Hero */}
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-16">
            <div className="flex flex-col justify-center">
              <span className="mb-5 w-fit rounded-full border border-brand-100 bg-white px-4 py-2 text-xs font-bold uppercase text-brand-700 shadow-sm">
                Platform Ujian Resmi Masjid Istiqlal
              </span>
              <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Ujian CBT TOAFL<br />
                <span className="mt-2 flex flex-wrap items-center gap-4 sm:flex-nowrap">
                  Berbasis Sesi
                  <span className="text-base font-bold tracking-normal text-slate-800 sm:text-lg">
                    Sertifikasi Kemahiran<br />
                    Bahasa Arab (TOAFL)<br />
                    Resmi &amp; Terpercaya.
                  </span>
                </span>
              </h1>
              <p className="mt-8 max-w-2xl border-l-4 border-brand-500 pl-4 text-base leading-8 text-slate-600 sm:text-lg">
                Platform ujian online untuk TOAFL dan TOEFL dengan sistem berbasis
                sesi, pembayaran per tes, randomisasi soal, auto-save, dan pengaturan
                hasil per sesi.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/register" className="btn-primary">
                  <UserPlus className="h-4 w-4" />
                  Mulai Registrasi
                </Link>
                <Link href="/login" className="btn-secondary">
                  <LogIn className="h-4 w-4" />
                  Login Peserta
                </Link>
              </div>
              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                <div className="metric">
                  <p className="metric-value">120 Menit</p>
                  <p className="metric-label">Durasi pengerjaan optimal.</p>
                </div>
                <div className="metric">
                  <p className="metric-value">Simpan Otomatis</p>
                  <p className="metric-label">Jawaban aman, bebas khawatir hilang.</p>
                </div>
                <div className="metric">
                  <p className="metric-value">Format Arab Sempurna</p>
                  <p className="metric-label">Teks Right-to-Left yang jelas &amp; nyaman dibaca.</p>
                </div>
              </div>
            </div>

            {/* Preview Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
              <div className="rounded-xl bg-slate-950 p-4 text-white">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <p className="text-sm font-bold">TOAFL Exam Preview</p>
                    <p className="text-xs text-slate-400">Listening Section</p>
                  </div>
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-300">
                    Saved
                  </span>
                </div>
                <div className="mt-5 rounded-xl bg-white p-5 text-slate-900">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
                      Question 12
                    </span>
                    <span className="font-mono text-sm font-bold text-rose-600">
                      18:42
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">
                    Listen to the audio and choose the best answer.
                  </p>
                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-600 text-white">
                        <Play className="h-4 w-4 fill-current" />
                      </span>
                      <span className="h-2 flex-1 rounded-full bg-slate-200">
                        <span className="block h-2 w-1/3 rounded-full bg-brand-600" />
                      </span>
                      <span className="text-xs font-bold text-slate-500">1/2</span>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="rounded-xl border border-brand-200 bg-brand-50 p-3 text-sm font-semibold text-brand-900">
                      A. The speaker agrees with the plan.
                    </div>
                    <div className="rounded-xl border border-slate-200 p-3 text-sm font-semibold">
                      B. The speaker rejects the proposal.
                    </div>
                    <div className="rounded-xl border border-slate-200 p-3 text-sm font-semibold">
                      C. The speaker asks for more time.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-4">
            <article className="feature">
              <ClipboardEdit className="h-7 w-7 text-brand-600" />
              <h3>Register</h3>
              <p>Peserta daftar dan upload bukti pembayaran.</p>
            </article>
            <article className="feature">
              <BadgeCheck className="h-7 w-7 text-emerald-600" />
              <h3>Approval</h3>
              <p>Admin verifikasi sebelum peserta bisa akses ujian.</p>
            </article>
            <article className="feature">
              <Shuffle className="h-7 w-7 text-amber-600" />
              <h3>Random Paket</h3>
              <p>Setiap peserta mendapat susunan soal berbeda.</p>
            </article>
            <article className="feature">
              <BarChart3 className="h-7 w-7 text-violet-600" />
              <h3>Result</h3>
              <p>Skor tampil jika diizinkan oleh admin.</p>
            </article>
          </div>
        </section>
      </main>
      <FlowNav currentHref="/" />
      <Footer />
    </>
  );
}
