"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  lastPage: number;
  total: number;
  perPage: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  lastPage,
  total,
  perPage,
  onPageChange,
}: PaginationProps) {
  if (lastPage <= 1) return null;

  const from = total === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const to = Math.min(currentPage * perPage, total);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const delta = 1;
    const left = Math.max(2, currentPage - delta);
    const right = Math.min(lastPage - 1, currentPage + delta);

    pages.push(1);
    if (left > 2) pages.push("...");
    for (let i = left; i <= right; i++) {
      pages.push(i);
    }
    if (right < lastPage - 1) pages.push("...");
    if (lastPage > 1) pages.push(lastPage);
    return pages;
  };

  return (
    <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-xs text-slate-500">
        Menampilkan <span className="font-semibold">{from}</span>–
        <span className="font-semibold">{to}</span> dari{" "}
        <span className="font-semibold">{total}</span> data
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {getPageNumbers().map((page, idx) =>
          typeof page === "string" ? (
            <span
              key={`ellipsis-${idx}`}
              className="inline-flex h-8 w-8 items-center justify-center text-xs text-slate-400"
            >
              {page}
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition ${
                page === currentPage
                  ? "bg-brand-600 text-white"
                  : "border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {page}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= lastPage}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Halaman berikutnya"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
