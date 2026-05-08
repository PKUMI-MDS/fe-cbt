import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FlowNav from "@/components/FlowNav";
import AuthGuard from "@/components/AuthGuard";

export const metadata = { title: "CAT/CBT TOAFL - Profil" };

export default function ProfilePage() {
  return (
    <AuthGuard>
      <Header />
      <main id="main">
        <section className="page-wrap max-w-4xl">
          <h1 className="page-title">Profil Peserta</h1>
          <div className="mt-8 panel">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-xl bg-brand-100 text-xl font-extrabold text-brand-700">
                PS
              </div>
              <div>
                <h2 className="text-xl font-extrabold">Nama Peserta</h2>
                <p className="text-sm text-slate-500">email@domain.com</p>
              </div>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="info-box">
                <small>Username</small>
                <strong>-</strong>
              </div>
              <div className="info-box">
                <small>WhatsApp</small>
                <strong>-</strong>
              </div>
              <div className="info-box">
                <small>Ujian</small>
                <strong>TOAFL</strong>
              </div>
              <div className="info-box">
                <small>Status</small>
                <strong className="text-emerald-700">Approved</strong>
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
