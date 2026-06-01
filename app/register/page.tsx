import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RegisterForm from "@/components/RegisterForm";
import { getRegistrationStatus } from "@/lib/auth-api";

export const metadata = { title: "CAT/CBT TOAFL - Register" };

export default async function RegisterPage() {
  let registrationStatus = { is_open: true, message: "", open_date: null, close_date: null };

  try {
    registrationStatus = await getRegistrationStatus();
  } catch {
    // ignore — allow register if status endpoint fails
  }

  return (
    <>
      <Header />
      <main id="main">
        <section className="page-wrap">
          <p className="eyebrow">Step 1 / Registration</p>
          <h1 className="page-title">Daftar Peserta Ujian</h1>
          <p className="page-desc">
            Isi data diri untuk membuat akun peserta dan menunggu proses verifikasi admin.
          </p>
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
            <RegisterForm registrationStatus={registrationStatus} />

            <aside className="rounded-2xl bg-slate-950 p-6 text-white shadow-soft">
              <h2 className="text-xl font-extrabold">Alur setelah daftar</h2>
              <div className="mt-6 space-y-5">
                <div className="step-dark">
                  <span>1</span>
                  <p>
                    Data registrasi masuk ke antrian verifikasi admin.
                  </p>
                </div>
                <div className="step-dark">
                  <span>2</span>
                  <p>Akun masih pending, belum bisa mengakses ujian.</p>
                </div>
                <div className="step-dark">
                  <span>3</span>
                  <p>
                    Setelah approved, peserta bisa login dan melihat dashboard
                    ujian.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
