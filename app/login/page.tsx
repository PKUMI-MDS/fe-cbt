import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FlowNav from "@/components/FlowNav";

export const metadata = { title: "CAT/CBT TOAFL - Login" };

export default function LoginPage() {
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

          <form className="panel">
            <h2 className="text-2xl font-extrabold text-slate-950">
              Login Peserta
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Masukkan akun yang sudah disetujui admin.
            </p>
            <div className="mt-6 space-y-4">
              <label className="field">
                <span>Username / Email</span>
                <input name="email" type="email" placeholder="nama@email.com" required />
              </label>
              <label className="field">
                <span>Password</span>
                <input name="password" type="password" placeholder="Masukkan password" required />
              </label>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3 text-sm">
              <label className="flex items-center gap-2 text-slate-500">
                <input type="checkbox" className="rounded" />
                Remember me
              </label>
              <Link
                href="/forgot-password"
                className="font-bold text-brand-700"
              >
                Lupa password?
              </Link>
            </div>
            <button
              type="submit"
              className="mt-6 w-full justify-center btn-primary"
            >
              Login
            </button>
            <p className="mt-5 text-center text-sm text-slate-500">
              Belum punya akun?{" "}
              <Link href="/register" className="font-bold text-brand-700">
                Daftar sekarang
              </Link>
            </p>
          </form>
        </section>
      </main>
      <FlowNav />
      <Footer />
    </>
  );
}
