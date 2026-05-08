"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthSession } from "@/lib/use-auth-session";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { status } = useAuthSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [router, status]);

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

  return <>{children}</>;
}
