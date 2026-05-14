"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Phone, Building2, ShieldCheck, Mail, MapPin, Pencil, CheckCircle } from "lucide-react";
import { getMyProfile, updateProfile } from "@/lib/auth-api";
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
  const queryClient = useQueryClient();
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["profile"],
    queryFn: getMyProfile,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    institution: "",
    address: "",
  });
  const [formError, setFormError] = useState("");

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setIsEditing(false);
      setFormError("");
    },
    onError: (err: Error) => {
      setFormError(err.message || "Gagal memperbarui profil.");
    },
  });

  const startEditing = () => {
    setFormData({
      name: profile?.name ?? "",
      email: profile?.email ?? "",
      phone: profile?.profile?.phone ?? "",
      institution: profile?.profile?.institution ?? "",
      address: profile?.profile?.address ?? "",
    });
    setFormError("");
    setIsEditing(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const payload: Record<string, string | null> = {};
    if (formData.name.trim()) payload.name = formData.name.trim();
    if (formData.email.trim()) payload.email = formData.email.trim();
    payload.phone = formData.phone.trim() || null;
    payload.institution = formData.institution.trim() || null;
    payload.address = formData.address.trim() || null;

    mutation.mutate(payload);
  };

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-xl bg-brand-100 text-xl font-extrabold text-brand-700" aria-hidden="true">
            {initials(profile?.name)}
          </div>
          <div>
            <h2 className="text-xl font-extrabold">{profile?.name ?? "-"}</h2>
            <p className="text-sm text-slate-500">{profile?.email ?? "-"}</p>
          </div>
        </div>
        {!isEditing && (
          <button
            onClick={startEditing}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-100"
          >
            <Pencil className="h-4 w-4" />
            Edit Profil
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-slate-700">Nama Lengkap</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                className="field w-full mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                className="field w-full mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Nomor Telepon</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                className="field w-full mt-1"
                placeholder="08xxxxxxxxxx"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Institusi</label>
              <input
                type="text"
                value={formData.institution}
                onChange={(e) => setFormData((p) => ({ ...p, institution: e.target.value }))}
                className="field w-full mt-1"
                placeholder="Nama sekolah / universitas"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-700">Alamat</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
                className="field w-full mt-1"
                placeholder="Alamat lengkap"
              />
            </div>
          </div>

          {formError && (
            <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
              {formError}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="btn-primary disabled:opacity-50"
            >
              {mutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="btn-secondary"
            >
              Batal
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="info-box flex items-start gap-3">
            <div className="rounded-lg bg-brand-50 p-2 text-brand-600">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <small className="block text-slate-500">WhatsApp</small>
              <strong className="text-slate-900">{profile?.profile?.phone ?? "-"}</strong>
            </div>
          </div>
          <div className="info-box flex items-start gap-3">
            <div className="rounded-lg bg-brand-50 p-2 text-brand-600">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <small className="block text-slate-500">Institusi</small>
              <strong className="text-slate-900">{profile?.profile?.institution ?? "-"}</strong>
            </div>
          </div>
          <div className="info-box flex items-start gap-3">
            <div className="rounded-lg bg-brand-50 p-2 text-brand-600">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <small className="block text-slate-500">Alamat</small>
              <strong className="text-slate-900">{profile?.profile?.address ?? "-"}</strong>
            </div>
          </div>
          <div className="info-box flex items-start gap-3">
            <div className="rounded-lg bg-brand-50 p-2 text-brand-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <small className="block text-slate-500">Status Akun</small>
              <strong className={`block ${profile?.account_status === "active" ? "text-emerald-700" : "text-amber-700"}`}>
                {accountStatusLabel(profile?.account_status)}
              </strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
