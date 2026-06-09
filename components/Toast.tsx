"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface ToastProps {
  message: string;
  onHide: () => void;
}

export default function Toast({ message, onHide }: ToastProps) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (message) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => onHide(), 7000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [message]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!message) return null;

  return (
    <div
      role="status"
      className="fixed right-4 top-4 z-[90] flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-soft"
    >
      {message}
      <button
        onClick={onHide}
        className="ml-1 rounded p-0.5 hover:bg-white/20"
        aria-label="Tutup notifikasi"
      >
        <X size={14} />
      </button>
    </div>
  );
}
