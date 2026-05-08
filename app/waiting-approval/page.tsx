import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FlowNav from "@/components/FlowNav";
import { Hourglass } from "lucide-react";

export const metadata = { title: "CAT/CBT TOAFL - Waiting Approval" };

export default function WaitingApprovalPage() {
  return (
    <>
      <Header />
      <main id="main">
        <section className="center-wrap">
          <div className="status-panel border border-amber-200">
            <Hourglass className="mx-auto h-16 w-16 text-amber-600" />
            <h1>Menunggu Verifikasi Admin</h1>
            <p>
              Registrasi berhasil dikirim. Akun belum bisa mengakses ujian
              sampai bukti pembayaran disetujui admin.
            </p>
            <div className="status-grid">
              <div>
                <small>Status Akun</small>
                <strong className="text-amber-700">Pending</strong>
              </div>
              <div>
                <small>Ujian</small>
                <strong>TOAFL</strong>
              </div>
              <div>
                <small>Bukti Bayar</small>
                <strong className="text-emerald-700">Uploaded</strong>
              </div>
            </div>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/login" className="btn-secondary">
                Kembali ke Login
              </Link>
              <Link href="/login" className="btn-primary">
                Cek Status Nanti
              </Link>
            </div>
          </div>
        </section>
      </main>
      <FlowNav />
      <Footer />
    </>
  );
}
