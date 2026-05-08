import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FlowNav from "@/components/FlowNav";

export const metadata = { title: "CAT/CBT TOAFL - Score Detail" };

export default function ScoreDetailPage() {
  return (
    <>
      <Header />
      <main id="main">
        <section className="page-wrap max-w-4xl">
          <Link href="/exam/history" className="btn-secondary mb-6">
            Kembali ke History
          </Link>
          <div className="panel mt-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <p className="eyebrow">Score Detail</p>
                <h1 className="mt-2 text-3xl font-extrabold text-slate-950">
                  TOEFL Tryout Result
                </h1>
                <p className="mt-2 text-slate-500">
                  Nama Peserta — 12 Mei 2026
                </p>
              </div>
              <div className="rounded-xl bg-brand-50 p-6 text-center">
                <p className="text-xs font-bold uppercase text-brand-700">
                  Total Score
                </p>
                <p className="mt-1 text-4xl font-extrabold text-brand-700">
                  82
                </p>
              </div>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="info-box">
                <small>Listening</small>
                <strong className="text-3xl">80</strong>
              </div>
              <div className="info-box">
                <small>Structure</small>
                <strong className="text-3xl">78</strong>
              </div>
              <div className="info-box">
                <small>Reading</small>
                <strong className="text-3xl">88</strong>
              </div>
            </div>
            <div className="mt-6 rounded-xl bg-amber-50 p-5 text-sm leading-6 text-amber-800">
              Review soal dan kunci jawaban tidak ditampilkan untuk menjaga
              keamanan bank soal.
            </div>
          </div>
        </section>
      </main>
      <FlowNav />
      <Footer />
    </>
  );
}
