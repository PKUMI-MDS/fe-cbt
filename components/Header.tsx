"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/register", label: "Register" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/exam/history", label: "History" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 glass">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex min-h-11 items-center gap-3 rounded-xl text-left focus:outline-none focus:ring-4 focus:ring-brand-100"
          aria-label="Ke landing page"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-600 text-base font-black text-white shadow-lg shadow-sky-100">
            C
          </span>
          <span>
            <span className="block text-sm font-extrabold text-slate-950">
              CBT IAIN
            </span>
            <span className="block text-xs text-slate-500">
              TOAFL / TOEFL Platform
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Navigasi utama">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                pathname === link.href
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-xl px-4 py-2 text-sm font-bold text-brand-700 hover:bg-brand-50 sm:inline-flex"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="inline-flex min-h-11 items-center rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-sky-100 hover:bg-brand-700"
          >
            Daftar
          </Link>
        </div>
      </div>
    </header>
  );
}
