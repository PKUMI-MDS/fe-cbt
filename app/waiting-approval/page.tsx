import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WaitingApprovalStatus from "@/components/WaitingApprovalStatus";

export const metadata = { title: "CAT/CBT TOAFL - Waiting Approval" };

export default function WaitingApprovalPage() {
  return (
    <>
      <Header />
      <main id="main">
        <section className="center-wrap">
          <WaitingApprovalStatus />
        </section>
      </main>
      <Footer />
    </>
  );
}
