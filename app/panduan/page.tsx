import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  UserPlus,
  Upload,
  BadgeCheck,
  Calendar,
  BarChart3,
  Shuffle,
  Timer,
  Save,
  Volume2,
  ShieldCheck,
  EyeOff,
} from "lucide-react";

export const metadata = {
  title: "Panduan - CBT TOAFL ILC",
};

export default function PanduanPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 py-16">
        {/* Alur Ujian Section */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <span className="text-sm font-bold text-brand-600">Alur Ujian</span>
            <h1 className="mt-2 text-3xl font-extrabold text-slate-950 sm:text-4xl">
              Panduan Mengikuti Ujian
            </h1>
            <p className="mt-4 text-slate-500">
              Ikuti alur berikut untuk mengikuti ujian CBT TOAFL
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Card 1 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                <UserPlus className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-900">1. Registrasi</h3>
              <p className="text-sm leading-relaxed text-slate-500">
                Daftar akun untuk mendapatkan akses mengikuti tes.
              </p>
            </div>

            {/* Card 2 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Upload className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-900">2. Unggah Bukti Pembayaran</h3>
              <p className="text-sm leading-relaxed text-slate-500">
                Unggah bukti pembayaran agar admin dapat memverifikasi transaksi Anda.
              </p>
            </div>
            
            {/* Card 3 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <BadgeCheck className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-900">3. Approval</h3>
              <p className="text-sm leading-relaxed text-slate-500">
                Admin verifikasi pembayaran. Setiap approval berlaku untuk satu kali tes.
              </p>
            </div>

            {/* Card 4 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-900">4. Sesi Tes</h3>
              <p className="text-sm leading-relaxed text-slate-500">
                Peserta ditempatkan ke sesi dengan tanggal, waktu, dan paket soal tertentu.
              </p>
            </div>

            {/* Card 5 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-900">5. Hasil</h3>
              <p className="text-sm leading-relaxed text-slate-500">
                Hasil ditampilkan sesuai pengaturan per sesi. Retake memerlukan pembayaran baru.
              </p>
            </div>
          </div>
        </section>

        {/* Divider */}
        {/* <div className="mx-auto my-20 max-w-7xl px-4 sm:px-6 lg:px-8">
          <hr className="border-slate-200" />
        </div> */}

        {/* Fitur Unggulan Section */}
        {/* <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <span className="text-sm font-bold text-brand-600">Fitur Unggulan</span>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-950 sm:text-4xl">
              Dibuat untuk Ujian Profesional
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-brand-300 hover:shadow-md">
              <div className="mb-4 text-brand-600">
                <Shuffle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Randomisasi Soal</h3>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-brand-300 hover:shadow-md">
              <div className="mb-4 text-brand-600">
                <Timer className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Timer & Auto-Submit</h3>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-brand-300 hover:shadow-md">
              <div className="mb-4 text-brand-600">
                <Save className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Auto-Save & Resume</h3>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-brand-300 hover:shadow-md">
              <div className="mb-4 text-brand-600">
                <Volume2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Soal Audio</h3>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-brand-300 hover:shadow-md">
              <div className="mb-4 text-brand-600">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Anti-Cheat</h3>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-brand-300 hover:shadow-md">
              <div className="mb-4 text-brand-600">
                <EyeOff className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Visibilitas Hasil</h3>
            </div>
          </div>
        </section> */}
      </main>
      <Footer />
    </>
  );
}
