import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthGuard from "@/components/AuthGuard";
import DashboardContent from "@/components/DashboardContent";

export const metadata = { title: "CAT/CBT TOAFL - Dashboard" };

export default function DashboardPage() {
  return (
    <AuthGuard>
      <Header />
      <main id="main">
        <section className="page-wrap">
          <DashboardContent />
        </section>
      </main>
      <Footer />
    </AuthGuard>
  );
}
