import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoginForm from "@/components/LoginForm";
import { getRegistrationStatus } from "@/lib/auth-api";
import type { RegistrationStatus } from "@/lib/types";

export const metadata = { title: "CAT/CBT TOAFL - Login" };

export default async function LoginPage() {
  let registrationStatus: RegistrationStatus = { is_open: true, message: "", open_date: null, close_date: null };

  try {
    registrationStatus = await getRegistrationStatus();
  } catch {
    // ignore — allow login if status endpoint fails
  }

  return (
    <>
      <Header />
      <main id="main">
        <section className="mx-auto grid min-h-[72vh] max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="hidden lg:block">
            <p className="eyebrow">Secure Login</p>
            <h1 className="mt-3 text-4xl font-extrabold text-slate-950">
              Masuk ke dashboard peserta.
            </h1>
            <p className="mt-4 text-lg leading-8 text-slate-500">
              Akun yang belum di-approve diarahkan ke halaman status, bukan
              dashboard ujian.
            </p>
          </div>

          <LoginForm registrationStatus={registrationStatus} />
        </section>
      </main>
      <Footer />
    </>
  );
}
