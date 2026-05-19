"use client";

import { Banknote, Building2, Copy, CreditCard, Phone, User, Wallet } from "lucide-react";
import { useState } from "react";

export default function PaymentInfo() {
  const [copied, setCopied] = useState(false);

  const accountNumber = "100 0278645";

  function copyToClipboard(text: string) {
    void navigator.clipboard.writeText(text.replace(/\s/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5">
      <div className="flex items-center gap-2">
        <div className="grid size-8 place-items-center rounded-lg bg-emerald-600 text-white">
          <Wallet className="size-4" />
        </div>
        <h4 className="text-sm font-bold text-slate-900">Informasi Pembayaran</h4>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-start gap-3">
          <Banknote className="mt-0.5 size-4 shrink-0 text-emerald-600" />
          <div>
            <p className="text-xs font-semibold text-slate-500">Biaya Pendaftaran</p>
            <p className="text-sm font-bold text-slate-900">Rp. 150.000,-</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Building2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
          <div>
            <p className="text-xs font-semibold text-slate-500">Bank</p>
            <p className="text-sm font-bold text-slate-900">Bank Mega Syariah</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <User className="mt-0.5 size-4 shrink-0 text-emerald-600" />
          <div>
            <p className="text-xs font-semibold text-slate-500">Atas Nama</p>
            <p className="text-sm font-semibold text-slate-900">
              Badan Pengelola Masjid Istiqlal qq Pendidikan Kader Ulama Masjid Istiqlal
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <CreditCard className="mt-0.5 size-4 shrink-0 text-emerald-600" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-500">No. Rekening</p>
            <div className="flex items-center gap-2">
              <p className="font-mono text-sm font-bold tracking-wide text-slate-900">{accountNumber}</p>
              <button
                type="button"
                onClick={() => copyToClipboard(accountNumber)}
                className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-0.5 text-xs font-semibold text-emerald-700 shadow-sm ring-1 ring-inset ring-emerald-200 transition hover:bg-emerald-50"
                title="Salin nomor rekening"
              >
                <Copy className="size-3" />
                {copied ? "Tersalin!" : "Salin"}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Phone className="mt-0.5 size-4 shrink-0 text-emerald-600" />
          <div>
            <p className="text-xs font-semibold text-slate-500">Contact Person</p>
            <a
              href="https://wa.me/6285215388348"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-emerald-700 underline-offset-2 hover:underline"
            >
              +62 852-1538-8348
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
