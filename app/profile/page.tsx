import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FlowNav from "@/components/FlowNav";
import AuthGuard from "@/components/AuthGuard";
import ProfileContent from "@/components/ProfileContent";

export const metadata = { title: "CAT/CBT TOAFL - Profil" };

export default function ProfilePage() {
  return (
    <AuthGuard>
      <Header />
      <main id="main">
        <section className="page-wrap max-w-4xl">
          <h1 className="page-title">Profil Peserta</h1>
          <ProfileContent />
        </section>
      </main>
      <FlowNav />
      <Footer />
    </AuthGuard>
  );
}
