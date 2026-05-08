import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FlowNav from "@/components/FlowNav";
import { UserRound } from "lucide-react";

export const metadata = { title: "CAT/CBT TOAFL - Dashboard" };

export default function DashboardPage() {
  return (
    <>
      <Header />
      <main id="main">
        <section className="page-wrap">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="eyebrow">Dashboard Peserta</p>
              <h1 className="page-title">Halo, Peserta</h1>
              <p className="page-desc">
                Akun kamu aktif. Silakan cek ujian yang tersedia.
              </p>
            </div>
            <Link href="/profile" className="btn-secondary">
              <UserRound className="h-4 w-4" />
              Lihat Profil
            </Link>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_360px]">
            <div className="space-y-5">
              {/* Ujian Tersedia */}
              <div className="panel animate-fade-in-up">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <span className="badge-success">Available</span>
                    <h2 className="mt-4 text-2xl font-extrabold text-slate-950">
                      TOAFL Online Test - Paket Hari Ini
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                      Ujian Bahasa Arab dengan random package per peserta.
                    </p>
                  </div>
                  <div className="rounded-xl bg-brand-50 p-4 text-center">
                    <p className="text-2xl font-extrabold text-brand-700">90</p>
                    <p className="text-xs font-bold text-brand-900">Questions</p>
                  </div>
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-4">
                  <div className="info-box">
                    <small>Tanggal</small>
                    <strong>Hari ini</strong>
                  </div>
                  <div className="info-box">
                    <small>Durasi</small>
                    <strong>120 menit</strong>
                  </div>
                  <div className="info-box">
                    <small>Timer</small>
                    <strong className="text-emerald-700">Aktif</strong>
                  </div>
                  <div className="info-box">
                    <small>Status</small>
                    <strong className="text-brand-700">Belum mulai</strong>
                  </div>
                </div>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link href="/exam/detail" className="btn-primary">
                    Lihat Detail Ujian
                  </Link>
                  <Link href="/exam/instruction" className="btn-secondary">
                    Baca Instruksi
                  </Link>
                </div>
              </div>

              {/* Riwayat */}
              <div className="panel animate-fade-in-up delay-100">
                <h2 className="text-lg font-extrabold text-slate-950">
                  Riwayat Terakhir
                </h2>
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
                      <tr>
                        <td className="px-4 py-4 font-semibold">TOEFL Tryout</td>
                        <td className="px-4 py-4">12 Mei 2026</td>
                        <td className="px-4 py-4 font-bold text-emerald-700">
                          Selesai
                        </td>
                        <td className="px-4 py-4 font-bold">82</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="space-y-5">
              <div className="rounded-2xl bg-slate-950 p-6 text-white shadow-soft animate-fade-in-up delay-200">
                <h3 className="text-lg font-extrabold">Checklist Sebelum Ujian</h3>
                <div className="mt-5 space-y-3 text-sm text-slate-300">
                  <p>Koneksi internet stabil</p>
                  <p>Laptop atau desktop disarankan</p>
                  <p>Browser modern</p>
                  <p>Jangan buka tab lain</p>
                </div>
              </div>
              <div className="panel animate-fade-in-up delay-300">
                <h3 className="font-extrabold text-slate-950">Butuh bantuan?</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Hubungi helpdesk jika akun belum aktif atau ujian tidak muncul.
                </p>
                <button className="mt-4 w-full justify-center btn-secondary">
                  Contact Helpdesk
                </button>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <FlowNav />
      <Footer />
    </>
  );
}
