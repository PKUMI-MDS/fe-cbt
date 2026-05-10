# Alur Kerja Fitur — FE-CBT (Real Project)

Dokumen ini menjelaskan alur kerja fitur-fitur yang baru ditambahkan/ditingkatkan pada frontend CBT (fe-cbt). Dokumen ini ditujukan untuk tim developer dan QA.

---

## 📌 Fitur 1: Account Status Notification

### Lokasi File
- `components/WaitingApprovalStatus.tsx`
- `app/waiting-approval/page.tsx`

### Alur Kerja

```
┌─────────────────────────────────────────────────────────────────┐
│  Peserta register / login dengan status "pending_verification"  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Redirect ke /waiting-approval                                  │
│  Komponen WaitingApprovalStatus dirender                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Polling GET /api/me setiap 30 detik                            │
│  (useAuthSession.refresh() via setInterval)                     │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              │                               │
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────────┐
│  Status tetap pending   │     │  Status berubah → "active"  │
│  Tampilkan ikon jam     │     │  (Admin approve di backend) │
│  Tombol "Refresh" aktif │     └─────────────────────────────┘
└─────────────────────────┘                   │
                                              ▼
                              ┌─────────────────────────────┐
                              │  Toast muncul:              │
                              │  "🎉 Selamat! Akun Anda     │
                              │   telah disetujui admin."   │
                              └─────────────────────────────┘
                                              │
                                              ▼
                              ┌─────────────────────────────┐
                              │  Countdown 5 detik dimulai  │
                              │  (setInterval 1000ms)       │
                              └─────────────────────────────┘
                                              │
                                              ▼
                              ┌─────────────────────────────┐
                              │  Auto-redirect ke /dashboard│
                              │  (router.push)              │
                              └─────────────────────────────┘
```

### State Transitions

| State Awal | State Akhir | Trigger | Aksi UI |
|-----------|-------------|---------|---------|
| `pending_verification` | `active` | Polling mendeteksi perubahan | Toast + Countdown + Auto-redirect |
| `pending_verification` | `rejected` | Polling mendeteksi perubahan | Icon berubah ke XCircle + pesan ditolak |
| `pending_verification` | `pending_verification` | Polling tidak mendeteksi perubahan | Tetap tampilkan ikon Hourglass |

### Catatan Teknis
- Polling dihentikan otomatis saat status sudah `active` (cleanup `clearInterval`)
- Toast menggunakan komponen `Toast.tsx` dengan auto-hide 2.4 detik
- Countdown dan auto-redirect menggunakan `useEffect` terpisah
- Ref `previousStatusRef` digunakan untuk mendeteksi transisi status (bukan hanya status saat ini)

---

## 📌 Fitur 2: Enhanced Payment Proof Form

### Lokasi File
- `components/PaymentProofForm.tsx`
- `app/payment-proof/page.tsx`

### Alur Kerja

#### A. Upload Bukti Pembayaran

```
┌─────────────────────────────────────────────────────────────┐
│  Peserta masuk ke /payment-proof                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Isi form:                                                  │
│  - File (jpg/png/pdf, max 5MB)                              │
│  - Nominal (angka, opsional)                                │
│  - Tanggal Bayar (date, opsional)                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Validasi Client-Side:                                      │
│  - File wajib diisi                                         │
│  - Format harus jpg/png/pdf                                 │
│  - Ukuran max 5MB                                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  POST /api/payment-proofs (multipart/form-data)             │
│  Body: { file, amount, payment_date }                       │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              │                               │
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────────┐
│  Upload Berhasil (200)  │     │  Upload Gagal (422/500)     │
│  - Form direset         │     │  - Tampilkan error message  │
│  - Success banner       │     │  - Field errors (jika ada)  │
│  - History di-refresh   │     └─────────────────────────────┘
└─────────────────────────┘
```

#### B. Riwayat & Status

```
┌─────────────────────────────────────────────────────────────┐
│  GET /api/payment-proofs (saat komponen mount)              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Tampilkan list payment proof dengan:                       │
│  - Status icon (Clock/CheckCircle/XCircle)                  │
│  - Badge warna (amber/emerald/rose)                         │
│  - Info file: nama, nominal (IDR), tgl bayar, tgl upload    │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              │                               │
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────────┐
│  Status = "rejected"    │     │  Status = "approved"        │
│  - Tampilkan alasan     │     │  - Icon CheckCircle hijau   │
│  - Alert banner di atas │     │  - Badge "Disetujui"        │
│  - Tombol "Upload Ulang"│     └─────────────────────────────┘
│    (scroll ke form)     │
└─────────────────────────┘
```

### Status Mapping

| Status Backend | Label UI | Icon | Warna |
|---------------|----------|------|-------|
| `pending_review` | Menunggu Review | Clock | Amber |
| `approved` | Disetujui | CheckCircle | Emerald |
| `rejected` | Ditolak | XCircle | Rose |

### Format Tampilan
- **Nominal**: `Rp 250.000` (Intl.NumberFormat IDR)
- **Tanggal**: `10 Mei 2026` (Intl.DateTimeFormat id-ID)
- **File**: Nama file asli + MIME type inference

---

## 📌 Fitur 3: E2E Test Suite (Playwright)

### Lokasi File
- `e2e/auth.spec.ts`
- `e2e/login.spec.ts`
- `e2e/protected-routes.spec.ts`
- `e2e/dashboard.spec.ts`
- `e2e/exam.spec.ts`
- `e2e/helpers.ts`
- `playwright.config.ts`

### Alur Kerja Testing

#### A. Auth Flow Tests

```
Test: Login Page Rendering
──────────────────────────
1. Navigasi ke /login
2. Assert: Title mengandung "CAT/CBT TOAFL"
3. Assert: Branding text "Masuk ke dashboard peserta." terlihat

Test: Login Validation (Empty Fields)
─────────────────────────────────────
1. Navigasi ke /login
2. Klik tombol submit tanpa mengisi form
3. Assert: Tetap di halaman /login (HTML5 required mencegah submit)
4. Assert: Input email masih terlihat

Test: Login Validation (Invalid Email)
──────────────────────────────────────
1. Navigasi ke /login
2. Isi email dengan format tidak valid ("invalid-email")
3. Klik submit
4. Assert: Tetap di halaman /login (HTML5 type="email" mencegah submit)

Test: Wrong Credentials
───────────────────────
1. Navigasi ke /login
2. Isi email & password yang salah
3. Klik submit
4. Wait 2 detik untuk response API
5. Assert: Error message terlihat (jika backend running)
   Skip: Jika backend tidak running

Test: Register Page Fields
──────────────────────────
1. Navigasi ke /register
2. Assert: Semua field terlihat (name, email, password, password_confirmation)

Test: Register Password Mismatch
────────────────────────────────
1. Navigasi ke /register
2. Isi semua field required (name, email, phone, password, password_confirmation)
3. Password dan konfirmasi berbeda
4. Klik submit
5. Assert: Error "Konfirmasi password tidak sama." terlihat
```

#### B. Protected Routes Tests

```
Test: Unauthenticated Redirect
──────────────────────────────
1. Clear cookies & localStorage
2. Navigasi ke /dashboard, /profile, /payment-proof
3. Assert: Redirect ke /login untuk semua route

Test: Public Pages Accessible
─────────────────────────────
1. Navigasi ke /panduan, /forgot-password
2. Assert: Tidak redirect ke login

Test: Login Page Accessible
───────────────────────────
1. Navigasi ke /login dalam keadaan unauthenticated
2. Assert: Form login terlihat
```

#### C. Dashboard & Exam Tests

```
Test: 404 Page
──────────────
1. Navigasi ke route yang tidak ada
2. Assert: Halaman 404 ter-render dengan pesan "tidak ditemukan"

Test: Waiting Approval Page
───────────────────────────
1. Navigasi ke /waiting-approval
2. Assert: Panel status terlihat dengan teks "Menunggu Verifikasi"

Test: Exam Instruction Page
───────────────────────────
1. Navigasi ke /exam/instruction
2. Assert: Petunjuk/instruksi terlihat

Test: Exam Anti-Cheat
─────────────────────
1. Navigasi ke /exam (jika authenticated)
2. Assert: Fullscreen modal muncul jika tidak ada attempt aktif
```

### Cara Menjalankan Test

```bash
# Install browser (satu kali)
npx playwright install

# Jalankan semua test
npx playwright test

# Jalankan dengan UI mode (debugging)
npx playwright test --ui

# Jalankan test spesifik
npx playwright test e2e/auth.spec.ts

# Lihat report HTML
npx playwright show-report
```

### Konfigurasi Test
- **Base URL**: `http://localhost:3000`
- **Browser**: Chromium (Desktop Chrome)
- **Retry**: 2x di CI, 0x di local
- **Workers**: 1 di CI, auto di local
- **Trace**: on-first-retry

---

## 📋 Ringkasan Perubahan File

| File | Perubahan | Fitur |
|------|-----------|-------|
| `components/WaitingApprovalStatus.tsx` | Rewrite | Account Status Notification |
| `components/PaymentProofForm.tsx` | Rewrite | Payment Proof UX Enhancement |
| `e2e/auth.spec.ts` | New | Auth E2E Tests |
| `e2e/login.spec.ts` | Updated | Login E2E Tests |
| `e2e/protected-routes.spec.ts` | New | Middleware E2E Tests |
| `e2e/dashboard.spec.ts` | New | Dashboard E2E Tests |
| `e2e/exam.spec.ts` | New | Exam E2E Tests |
| `e2e/helpers.ts` | New | Test Utilities |
