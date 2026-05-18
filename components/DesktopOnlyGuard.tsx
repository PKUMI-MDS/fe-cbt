"use client";

import { useEffect, useState } from "react";
import { Monitor, Smartphone } from "lucide-react";
import { isMobileDevice } from "@/lib/device";

export default function DesktopOnlyGuard({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    setIsMobile(isMobileDevice());

    function handleResize() {
      setIsMobile(isMobileDevice());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Saat SSR / hydration belum selesai, render children dulu
  // (nanti kalau terdeteksi mobile, akan diganti pesan error)
  if (isMobile === null) {
    return <>{children}</>;
  }

  if (isMobile) {
    return (
      <div className="center-wrap max-w-lg">
        <div className="panel w-full text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
            <Smartphone className="h-10 w-10 text-amber-600" />
          </div>
          <h1 className="mt-5 text-2xl font-extrabold text-slate-950">
            Perangkat Tidak Didukung
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Ujian CBT hanya dapat dilakukan menggunakan <strong className="text-slate-800">laptop atau desktop</strong>.
            Silakan akses kembali melalui perangkat tersebut untuk pengalaman ujian yang optimal dan keamanan sistem anti-cheat yang maksimal.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <Monitor className="h-4 w-4" />
            Gunakan Laptop / Desktop / PC
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
