import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FlowNav from "@/components/FlowNav";

export const metadata = { title: "CAT/CBT TOAFL - Forgot Password" };

export default function ForgotPasswordPage() {
  return (
    <>
      <Header />
      <main id="main">
        <section className="center-wrap max-w-lg">
          <div className="panel w-full">
            <h1 className="text-2xl font-extrabold text-slate-950">
              Reset Password
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Masukkan email untuk menerima instruksi reset password.
            </p>
            <label className="field mt-6">
              <span>Email</span>
              <input type="email" placeholder="email@example.com" />
            </label>
            <button
              type="button"
              className="mt-6 w-full justify-center btn-primary"
            >
              Kirim Instruksi
            </button>
            <Link
              href="/login"
              className="mt-3 w-full justify-center btn-secondary"
            >
              Kembali Login
            </Link>
          </div>
        </section>
      </main>
      <FlowNav currentHref="/forgot-password" />
      <Footer />
    </>
  );
}
