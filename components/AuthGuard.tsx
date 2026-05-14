"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useAuthSession } from "@/lib/use-auth-session";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { logout, status, user } = useAuthSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
      // Fallback: jika router.replace tidak berhasil dalam 2 detik, paksa redirect
      const fallback = setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
      return () => clearTimeout(fallback);
    }

    if (status === "authenticated" && user?.role !== "participant") {
      void logout();
      return;
    }

    const allowedForPending = pathname === "/waiting-approval" || pathname === "/payment-proof" || pathname.startsWith("/payment-proof/");
    if (status === "authenticated" && user?.account_status !== "active" && !allowedForPending) {
      router.replace("/waiting-approval");
    }
  }, [logout, pathname, router, status, user?.account_status, user?.role]);

  if (status === "loading") {
    return (
      <main className="center-wrap max-w-lg">
        <div className="panel w-full text-center">
          <p className="text-sm font-semibold text-slate-500">Memeriksa sesi peserta...</p>
        </div>
      </main>
    );
  }

  if (status === "unauthenticated") {
    return (
      <main className="center-wrap max-w-lg">
        <div className="panel w-full text-center">
          <p className="text-sm font-semibold text-slate-500">Mengalihkan ke halaman login...</p>
        </div>
      </main>
    );
  }

  if (user?.role !== "participant") {
    return null;
  }

  const allowedForPending = pathname === "/waiting-approval" || pathname === "/payment-proof" || pathname.startsWith("/payment-proof/");
  if (user?.account_status !== "active" && !allowedForPending) {
    return null;
  }

  return <>{children}</>;
}
