import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FlowNav from "@/components/FlowNav";

export const metadata = { title: "CAT/CBT TOAFL - Riwayat Ujian" };

export default function ExamHistoryPage() {
  return (
    <>
      <Header />
      <main id="main">
        <section className="page-wrap max-w-6xl">
          <h1 className="page-title">Riwayat Ujian</h1>
          <p className="page-desc">Daftar ujian yang pernah kamu ikuti.</p>
          <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-soft">
            <table className="min-w-[760px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-400">
                <tr>
                  <th className="px-6 py-4">Ujian</th>
                  <th className="px-6 py-4">Tanggal</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Skor</th>
                  <th className="px-6 py-4">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-6 py-5 font-bold">TOAFL Online Test</td>
                  <td className="px-6 py-5">Hari ini</td>
                  <td className="px-6 py-5 font-bold text-emerald-700">
                    Submitted
                  </td>
                  <td className="px-6 py-5">Hidden</td>
                  <td className="px-6 py-5">
                    <Link
                      href="/exam/score"
                      className="rounded-xl bg-brand-50 px-4 py-2 font-bold text-brand-700"
                    >
                      Detail
                    </Link>
                  </td>
                </tr>
                <tr className="border-t border-slate-100">
                  <td className="px-6 py-5 font-bold">TOEFL Tryout</td>
                  <td className="px-6 py-5">12 Mei 2026</td>
                  <td className="px-6 py-5 font-bold text-emerald-700">
                    Completed
                  </td>
                  <td className="px-6 py-5 font-bold">82</td>
                  <td className="px-6 py-5">
                    <Link
                      href="/exam/score"
                      className="rounded-xl bg-brand-50 px-4 py-2 font-bold text-brand-700"
                    >
                      Detail
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
      <FlowNav />
      <Footer />
    </>
  );
}
