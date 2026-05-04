"use client";

import { useEffect, useRef } from "react";

interface ToastProps {
  message: string;
  onHide: () => void;
}

export default function Toast({ message, onHide }: ToastProps) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (message) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => onHide(), 2400);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [message, onHide]);

  if (!message) return null;

  return (
    <div
      role="status"
      className="fixed right-4 top-4 z-[90] max-w-[calc(100vw-2rem)] rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-soft"
    >
      {message}
    </div>
  );
}
