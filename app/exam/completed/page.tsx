import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FlowNav from "@/components/FlowNav";
import { CheckCircle2 } from "lucide-react";

export const metadata = { title: "CAT/CBT TOAFL - Ujian Selesai" };

export default function ExamCompletedPage() {
  return (
    <>
      <Header />
      <main id="main">
        <section className="center-wrap">
          <div className="status-panel border border-emerald-200">
            <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-600" />
            <h1>Ujian Berhasil Disubmit</h1>
            <p>
              Jawaban sudah tersimpan. Hasil akan ditampilkan jika admin
              mengaktifkan visibilitas skor.
            </p>
            <div className="status-grid">
              <div>
                <small>Status</small>
                <strong className="text-emerald-700">Submitted</strong>
              </div>
              <div>
                <small>Answered</small>
                <strong>87/90</strong>
              </div>
              <div>
                <small>Score</small>
                <strong className="text-slate-500">Hidden</strong>
              </div>
            </div>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/dashboard" className="btn-primary">
                Dashboard
              </Link>
              <Link href="/exam/history" className="btn-secondary">
                Lihat Riwayat
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
