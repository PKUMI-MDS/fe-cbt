import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FlowNav from "@/components/FlowNav";
import { Paperclip } from "lucide-react";

export const metadata = { title: "CAT/CBT TOAFL - Register" };

export default function RegisterPage() {
  return (
    <>
      <Header />
      <main id="main">
        <section className="page-wrap">
          <p className="eyebrow">Step 1 / Registration</p>
          <h1 className="page-title">Daftar Peserta Ujian</h1>
          <p className="page-desc">
            Isi data diri dan upload bukti pembayaran untuk diverifikasi admin.
          </p>
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
            <form className="panel" action="/waiting-approval">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="field">
                  <span>Nama Lengkap</span>
                  <input defaultValue="Ahmad Fauzan" required />
                </label>
                <label className="field">
                  <span>Email</span>
                  <input type="email" defaultValue="ahmad@email.com" required />
                </label>
                <label className="field">
                  <span>No. WhatsApp</span>
                  <input type="tel" defaultValue="081234567890" required />
                </label>
                <label className="field">
                  <span>Username</span>
                  <input defaultValue="ahmadfauzan" required />
                </label>
                <label className="field">
                  <span>Password</span>
                  <input type="password" defaultValue="12345678" required />
                </label>
                <label className="field">
                  <span>Konfirmasi Password</span>
                  <input type="password" defaultValue="12345678" required />
                </label>
                <label className="field sm:col-span-2">
                  <span>Jenis Ujian</span>
                  <select>
                    <option>TOAFL - Arabic Proficiency Test</option>
                    <option>TOEFL - English Proficiency Test</option>
                    <option>TOAFIC</option>
                    <option>TOEFIC</option>
                  </select>
                </label>
              </div>

              <div className="mt-6 rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50/60 p-6 text-center">
                <Paperclip className="mx-auto h-10 w-10 text-brand-600" />
                <h3 className="mt-4 font-bold text-slate-950">
                  Upload Bukti Pembayaran
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Format JPG, PNG, atau PDF. Maksimal 5MB.
                </p>
                <button
                  type="button"
                  className="mt-4 rounded-xl bg-white px-5 py-3 text-sm font-bold text-brand-700 shadow-sm"
                >
                  Pilih File
                </button>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Link href="/" className="btn-secondary">
                  Batal
                </Link>
                <button type="submit" className="btn-primary">
                  Submit Registrasi
                </button>
              </div>
            </form>

            <aside className="rounded-2xl bg-slate-950 p-6 text-white shadow-soft">
              <h2 className="text-xl font-extrabold">Alur setelah daftar</h2>
              <div className="mt-6 space-y-5">
                <div className="step-dark">
                  <span>1</span>
                  <p>
                    Data dan bukti pembayaran masuk ke antrian verifikasi admin.
                  </p>
                </div>
                <div className="step-dark">
                  <span>2</span>
                  <p>Akun masih pending, belum bisa mengakses ujian.</p>
                </div>
                <div className="step-dark">
                  <span>3</span>
                  <p>
                    Setelah approved, peserta bisa login dan melihat dashboard
                    ujian.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <FlowNav currentHref="/register" />
      <Footer />
    </>
  );
}
