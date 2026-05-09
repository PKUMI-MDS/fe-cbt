"use client";

import { useQuery } from "@tanstack/react-query";
import { getMyProfile } from "@/lib/auth-api";
import ProfileSkeleton from "@/components/ProfileSkeleton";

function initials(name?: string) {
  return (name ?? "P")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function accountStatusLabel(status?: string) {
  const labels: Record<string, string> = {
    active: "Aktif",
    pending_verification: "Pending",
    rejected: "Ditolak",
    suspended: "Ditangguhkan",
  };

  return status ? labels[status] ?? status : "-";
}

export default function ProfileContent() {
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["profile"],
    queryFn: getMyProfile,
  });

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return (
      <div className="mt-8 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
        {error instanceof Error ? error.message : "Gagal memuat profil."}
      </div>
    );
  }

  return (
    <div className="mt-8 panel">
      <div className="flex items-center gap-4">
        <div className="grid h-16 w-16 place-items-center rounded-xl bg-brand-100 text-xl font-extrabold text-brand-700">
          {initials(profile?.name)}
        </div>
        <div>
          <h2 className="text-xl font-extrabold">{profile?.name ?? "-"}</h2>
          <p className="text-sm text-slate-500">{profile?.email ?? "-"}</p>
        </div>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="info-box">
          <small>WhatsApp</small>
          <strong>{profile?.profile?.phone ?? "-"}</strong>
        </div>
        <div className="info-box">
          <small>Institusi</small>
          <strong>{profile?.profile?.institution ?? "-"}</strong>
        </div>
        <div className="info-box">
          <small>Nomor Identitas</small>
          <strong>{profile?.profile?.identity_number ?? "-"}</strong>
        </div>
        <div className="info-box">
          <small>Status</small>
          <strong className={profile?.account_status === "active" ? "text-emerald-700" : "text-amber-700"}>
            {accountStatusLabel(profile?.account_status)}
          </strong>
        </div>
      </div>
    </div>
  );
}
