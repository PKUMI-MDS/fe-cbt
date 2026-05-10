# FE-CBT Task Breakdown

Dokumen ini adalah breakdown pekerjaan frontend peserta `fe-cbt` berdasarkan kondisi repo saat ini dan kontrak API backend.

**Last Updated:** 2026-05-09

---

## Ringkasan Status

`fe-cbt` adalah aplikasi Next.js 14 dengan integrasi API backend yang sudah sangat lengkap:

| Area | Status |
|------|--------|
| **Auth Flow** | ✅ Lengkap (register → login → dashboard/logout) |
| **Payment Proof** | ✅ Upload & history real API |
| **Dashboard** | ✅ Real data dari backend |
| **Exam Engine** | ✅ Full integration (soal, audio, timer, navigasi, auto-save, submit) |
| **Hasil Ujian** | ✅ Score breakdown per section |
| **API Integration** | ✅ 100% real fetching |
| **Server Middleware** | ✅ `middleware.ts` baru ditambahkan |
| **Global UI States** | ✅ `loading.tsx`, `error.tsx`, `not-found.tsx` baru ditambahkan |

---

## Yang Sudah Selesai ✅

### 1. Environment dan API Client
- ✅ `NEXT_PUBLIC_API_BASE_URL` dengan fallback ke `http://localhost:8000/api`
- ✅ `apiRequest` support JSON dan FormData
- ✅ Token participant di `localStorage` + **sync ke cookie** untuk middleware
- ✅ Interceptor: 401 redirect login, 403 pending redirect waiting-approval, 422 field errors
- ✅ Typed wrappers semua endpoint ada di `lib/auth-api.ts`

### 2. Auth Pages
- ✅ Login real API dengan loading state dan disabled submit
- ✅ Register real API dengan validasi field
- ✅ Role check (hanya participant boleh login)
- ✅ Account status redirect (pending → waiting-approval)
- ✅ Logout participant

### 3. Payment Proof Peserta
- ✅ Page `/payment-proof` untuk upload dan riwayat
- ✅ Form fields: file, amount, payment_date
- ✅ Validasi file type dan size
- ✅ History dengan status dan rejection_reason

### 4. Waiting Approval / Account Status
- ✅ Fetch `GET /api/me`
- ✅ Polling status akun setiap 30 detik
- ✅ Tampilan sesuai status (pending/rejected/active)

### 5. Dashboard Peserta
- ✅ Fetch real data: profile, test-approvals, exam-sessions, active-attempt, results
- ✅ Tombol start/resume mengikuti state API
- ✅ Empty states

### 6. Exam Detail dan Instruction
- ✅ Detail session dari backend
- ✅ Start exam dengan validasi
- ✅ Error handling bisnis

### 7. Exam Engine
- ✅ Load active attempt (start/resume)
- ✅ Load question by number
- ✅ Render soal dari API (stem_html, image, audio, options)
- ✅ Save answer ke backend
- ✅ Mark doubtful
- ✅ Navigate soal
- ✅ Timer dari `remaining_seconds` backend
- ✅ Heartbeat berkala
- ✅ Submit dengan konfirmasi
- ✅ Auto-resume saat refresh

### 8. Audio Player
- ✅ Render audio dari `audio_url`
- ✅ Play count limit dari backend
- ✅ Tampilan max play dan remaining play

### 9. Anti-Cheat Client Events
- ✅ Violation logging endpoint

### 10. Exam Completed, Result, History
- ✅ Completed page membaca submit response
- ✅ Result visibility mengikuti `show_result_to_user`
- ✅ History fetch dari API

### 11. Profile Page
- ✅ Fetch `GET /api/my/profile`
- ✅ Tampil semua field user

### 12. Route Guard
- ✅ **Server-side middleware** (`middleware.ts`) - redirect berbasis cookie
- ✅ Client-side `AuthGuard` component
- ✅ Redirect authenticated users dari login/register

### 13. Global UI States (Baru - 9 Mei 2026)
- ✅ `app/loading.tsx` - Loading spinner global
- ✅ `app/error.tsx` - Error boundary dengan retry & dashboard link
- ✅ `app/not-found.tsx` - Halaman 404 dengan navigasi

---

## Yang Masih Belum / Perlu Perbaikan 🔧

### P1 - Exam Reliability
| # | Fitur | Status | Catatan |
|---|-------|--------|---------|
| 1 | **Fullscreen enforcement** | ✅ Selesai | Request fullscreen saat exam start, detect exit |
| 2 | **Tab switch detection** | ✅ Selesai | Detect visibility change, kirim violation |
| 3 | **Disable right click/copy** | ✅ Selesai | Di area exam |
| 4 | **Warning modal violation** | ✅ Selesai | Saat threshold terlewati |
| 5 | **Route guard saat exam aktif** | ✅ Selesai | Cegah keluar tanpa konfirmasi |

### P2 - Polish
| # | Fitur | Status | Catatan |
|---|-------|--------|---------|
| 1 | **Loading skeleton** | ✅ Selesai | Dashboard, history, exam perlu skeleton |
| 2 | **State management** | ✅ Selesai | Menggunakan @tanstack/react-query |
| 3 | **E2E tests** | ⏸️ Ditunda | Playwright (Dikerjakan nanti) |
| 4 | **Responsive mobile exam** | ✅ Selesai | Layout soal & navigasi grid |
| 5 | **Accessibility** | ✅ Selesai | Focus state, aria, keyboard navigation |

### P3 - Backend Integration & Notifications
| # | Fitur | Status | Catatan |
|---|-------|--------|---------|
| 1 | **Media Proxy Authentication** | ❌ Belum | Verifikasi token Sanctum untuk `<img src>` audio/image proxy |
| 2 | **Account Status Notification** | ❌ Belum | Implementasi websocket/polling untuk update status akun |

---

## Prioritas Sprint

### P0 - Integrasi Wajib ✅ DONE
- ✅ Login real API
- ✅ Register real API
- ✅ Route guard (server + client)
- ✅ Dashboard real API
- ✅ Upload payment proof
- ✅ Start/resume exam
- ✅ Get question/save answer/submit

### P1 - Exam Reliability ✅ DONE
- ✅ Fullscreen + tab switch detection
- ✅ Violation logging client events
- ✅ Result visibility
- ✅ Loading skeleton

### P2 - Polish
- ✅ Better UX for retake
- ✅ Richer history and profile
- ⏸️ E2E tests (Ditunda)
- ✅ State management layer

### P3 - Backend Integration & Notifications (NEW)
- Verifikasi keamanan URL media proxy (image/audio)
- Real-time/polling notifikasi status akun user
