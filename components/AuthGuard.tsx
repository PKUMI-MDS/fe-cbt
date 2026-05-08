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
    }

    if (status === "authenticated" && user?.role !== "participant") {
      void logout();
      return;
    }

    if (status === "authenticated" && user?.account_status !== "active" && pathname !== "/waiting-approval") {
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
    return null;
  }

  if (user?.role !== "participant") {
    return null;
  }

  if (user?.account_status !== "active" && pathname !== "/waiting-approval") {
    return null;
  }

  return <>{children}</>;
}
