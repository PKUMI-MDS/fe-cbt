import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FlowNav from "@/components/FlowNav";
import { LifeBuoy } from "lucide-react";

export const metadata = { title: "CAT/CBT TOAFL - Forgot Password" };

export default function ForgotPasswordPage() {
  return (
    <>
      <Header />
      <main id="main">
        <section className="center-wrap max-w-lg">
          <div className="panel w-full">
            <LifeBuoy className="h-10 w-10 text-brand-600" />
            <h1 className="text-2xl font-extrabold text-slate-950">
              Bantuan Reset Password
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Fitur reset password mandiri belum tersedia dari backend. Untuk
              mengganti password, hubungi admin atau helpdesk CBT dengan
              menyertakan email akun peserta.
            </p>
            <Link
              href="/login"
              className="mt-6 w-full justify-center btn-primary"
            >
              Kembali Login
            </Link>
          </div>
        </section>
      </main>
      <FlowNav />
      <Footer />
    </>
  );
}
