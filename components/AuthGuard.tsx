"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthSession } from "@/lib/use-auth-session";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { logout, status, user } = useAuthSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
      const fallback = setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
      return () => clearTimeout(fallback);
    }

    if (status === "authenticated" && user?.role !== "participant") {
      void logout();
      return;
    }
  }, [logout, router, status, user?.role]);

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

  return <>{children}</>;
}
