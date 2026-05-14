import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthGuard from "@/components/AuthGuard";
import PaymentProofForm from "@/components/PaymentProofForm";

export const metadata = { title: "CAT/CBT TOAFL - Bukti Pembayaran" };

export default function PaymentProofPage() {
  return (
    <AuthGuard>
      <Header />
      <main id="main">
        <section className="center-wrap max-w-2xl">
          <PaymentProofForm />
        </section>
      </main>
      <Footer />
    </AuthGuard>
  );
}
