# FE-CBT Task Breakdown

Dokumen ini adalah breakdown pekerjaan frontend peserta `fe-cbt` berdasarkan kondisi repo saat ini dan kontrak API backend.

## Ringkasan Status

`fe-cbt` sudah menjadi aplikasi Next.js 14 dengan halaman utama peserta yang lengkap secara visual:

- Landing.
- Login.
- Register.
- Waiting approval.
- Dashboard.
- Profile.
- Panduan.
- Exam detail.
- Exam instruction.
- Exam engine.
- Exam completed.
- Exam history.
- Score detail.

Helper API sudah ada di `lib/api.ts`, token helper ada di `lib/auth.ts`, dan tipe dasar auth sudah ada di `lib/types.ts`. Namun mayoritas page masih static/prototype dan belum melakukan real fetching/mutation ke API.

## Scope MVP Frontend Peserta

### 1. Environment dan API Client

Status: Parsial.

Yang sudah ada:

- `NEXT_PUBLIC_API_BASE_URL` fallback ke `http://localhost:8000/api`.
- `apiRequest` support JSON dan FormData.
- Token participant disimpan di `localStorage`.

Task:

- Buat `.env.local.example`:
  - `NEXT_PUBLIC_API_BASE_URL=https://be-cbt.miftadigital.cloud/api`
- Tentukan strategi auth:
  - MVP cepat: tetap localStorage.
  - Lebih aman: route handler/server action dengan httpOnly cookie.
- Tambahkan interceptor behavior:
  - 401 clear token dan redirect login.
  - 403 pending/rejected redirect ke status page.
  - 422 tampilkan field errors.
- Tambahkan typed wrappers:
  - `login`
  - `register`
  - `me`
  - `uploadPaymentProof`
  - `myProfile`
  - `myTestApprovals`
  - `myExamSessions`
  - `activeAttempt`
  - `startExam`
  - `resumeExam`
  - `getQuestion`
  - `saveAnswer`
  - `markDoubtful`
  - `navigate`
  - `heartbeat`
  - `logViolation`
  - `logAudioPlay`
  - `submitExam`
  - `result`
  - `resultHistory`

Acceptance criteria:

- Semua page tidak lagi hardcode API path sendiri.
- Error API tampil jelas dan tidak membuat UI blank.

## 2. Auth Pages

Status: Belum terhubung API penuh.

### Login

Task:

- Ubah login page menjadi client component atau pakai server action.
- Submit ke `POST /api/login`.
- Simpan token.
- Jika role bukan participant, tampilkan error.
- Jika account_status active, redirect dashboard.
- Jika pending/rejected/suspended, redirect waiting/status page dengan pesan.
- Tambahkan loading state dan disabled submit.
- Tambahkan validation message per field.
- Tambahkan logout participant.

Acceptance criteria:

- Peserta active bisa login.
- Peserta pending tidak masuk dashboard.
- Token tersimpan dan digunakan request berikutnya.

### Register

Task:

- Submit register ke `POST /api/register`.
- Sesuaikan field dengan backend:
  - name
  - email
  - password
  - password_confirmation
  - phone
  - institution
  - identity_number
- Catatan: backend register belum menerima jenis ujian dan file payment proof bersamaan. UI harus memisahkan:
  - Step 1 register akun.
  - Step 2 login/upload payment proof setelah akun bisa akses endpoint, atau backend perlu endpoint public payment proof jika bisnis mengharuskan upload saat register.
- Tambahkan confirm password validation.
- Tambahkan error duplicate email.
- Setelah sukses, redirect waiting approval.

Acceptance criteria:

- Register sukses membuat akun pending.
- Error validasi tampil di field terkait.

### Forgot Password

Status: Static.

Task:

- Tentukan apakah backend menyediakan reset password.
- Jika belum, mark as "hubungi admin" atau buat endpoint backend.

Acceptance criteria:

- Tidak ada form reset palsu tanpa backend.

## 3. Payment Proof Peserta

Status: Belum ada page khusus yang jelas di `fe-cbt`.

Task:

- Buat page/payment component untuk upload bukti pembayaran.
- Endpoint:
  - `POST /api/payment-proofs`
  - `GET /api/payment-proofs`
- Form fields:
  - file
  - amount
  - payment_date
- Validasi:
  - jpg/jpeg/png/pdf
  - max 5MB
  - required file
- Tampilkan history payment proof:
  - file_name
  - status
  - payment_date
  - rejection_reason jika ada.
- Tambahkan CTA upload ulang jika rejected.

Acceptance criteria:

- Peserta bisa upload proof dan melihat status.
- Rejected proof menampilkan alasan.

## 4. Waiting Approval / Account Status

Status: Visual page ada, belum real data.

Task:

- Fetch `GET /api/me` atau endpoint status yang sesuai.
- Jika token tidak ada, tampilkan instruksi login/register.
- Jika akun pending, tampilkan pending.
- Jika rejected, tampilkan alasan jika tersedia.
- Jika active, tampilkan CTA dashboard.
- Tambahkan polling ringan atau refresh manual untuk status approval.

Acceptance criteria:

- Status page mencerminkan status backend.

## 5. Dashboard Peserta

Status: Static.

Task:

- Fetch:
  - `GET /api/my/profile`
  - `GET /api/my/test-approvals`
  - `GET /api/my/exam-sessions`
  - `GET /api/my/active-attempt`
  - `GET /api/my/results`
- Tampilkan profile user dari API.
- Tampilkan daftar session assigned:
  - title
  - code
  - date/time
  - status
  - package
  - participant status.
- Tentukan tombol:
  - Detail
  - Mulai ujian
  - Lanjutkan ujian jika active attempt ada
  - Upload payment proof jika tidak ada approval available.
- Tampilkan result history jika ada.
- Tambahkan empty state untuk:
  - belum ada session
  - belum ada approval
  - akun belum active

Acceptance criteria:

- Dashboard tidak memakai hardcoded "TOAFL Online Test - Paket Hari Ini".
- Tombol start/resume mengikuti state API.

## 6. Exam Detail dan Instruction

Status: Static.

Task:

- Ambil detail session dari dashboard state atau endpoint backend jika tersedia.
- Tampilkan:
  - title
  - package
  - date/time
  - duration
  - total question
  - show result setting
  - anti-cheat rule
  - audio rule.
- Saat klik start:
  - validasi checkbox.
  - call `POST /api/exam-sessions/{session_id}/start`.
  - jika sudah ada active attempt, redirect resume.
  - simpan `attempt_id` di state/router.
- Tangani error:
  - session not open
  - not assigned
  - no available approval
  - already active attempt

Acceptance criteria:

- Start exam benar-benar membuat attempt backend.
- Error bisnis tampil jelas.

## 7. Exam Engine

Status: Visual/client state prototype.

Task:

- Load active attempt:
  - dari `POST start` response, atau
  - `GET /api/my/active-attempt`, atau
  - `GET /api/exam-attempts/{attempt}/resume`.
- Load question:
  - `GET /api/exam-attempts/{attempt}/questions/{number}`.
- Render question dari API:
  - stem_html
  - image_url
  - audio_url
  - options sesuai order snapshot
  - current selected answer
  - is_doubtful.
- Save answer:
  - call `POST /api/exam-attempts/{attempt}/answers`.
  - tampilkan Saving/Saved/Failed.
  - debounce atau immediate per select.
- Mark doubtful:
  - call `POST /api/exam-attempts/{attempt}/mark-doubt`.
- Navigate:
  - call `POST /api/exam-attempts/{attempt}/navigate`.
  - atau direct get question jika backend memberi endpoint cukup.
- Timer:
  - hitung dari `remaining_seconds` backend.
  - heartbeat berkala ke `POST /api/exam-attempts/{attempt}/heartbeat`.
  - jika heartbeat mengembalikan timeout/submitted, redirect completed.
- Submit:
  - confirmation modal.
  - `POST /api/exam-attempts/{attempt}/submit`.
- Auto-resume:
  - jika tab refresh, panggil resume dan restore current/progress.

Acceptance criteria:

- Jawaban benar-benar tersimpan ke backend.
- Refresh tidak mengubah soal.
- Timer lanjut dari backend.
- Submit final tidak bisa edit lagi.

## 8. Audio Player

Status: UI prototype.

Task:

- Render audio dari `audio_url`.
- Disable seeking:
  - kontrol custom.
  - jangan tampilkan native controls jika perlu.
- Saat play:
  - call `POST /api/exam-attempts/{attempt}/audio-play`.
  - jika `allowed = false`, blok play.
- Simpan play count per question.
- Tangani reload/resume:
  - backend harus mengembalikan play count atau frontend fetch dari question/attempt.
- Tampilkan max play dan remaining play.

Acceptance criteria:

- Audio tidak bisa dimainkan melebihi limit backend.
- Play count tercatat meski refresh.

## 9. Anti-Cheat Client Events

Status: Belum real.

Task:

- Fullscreen request saat exam start.
- Detect fullscreen exit.
- Detect visibility change/tab switch.
- Disable right click/copy selection di exam area.
- Kirim log ke:
  - `POST /api/exam-attempts/{attempt}/violations`
- Tampilkan warning modal jika backend/action threshold mengharuskan.
- Jangan overclaim anti-cheat 100%.

Acceptance criteria:

- Tab switch dan fullscreen exit tercatat di backend.
- UI memberi warning yang jelas.

## 10. Exam Completed, Result, History

Status: Static.

Task:

- Completed page membaca submit response.
- Jika result hidden, tampilkan "hasil menunggu admin".
- Jika result visible, fetch:
  - `GET /api/exam-attempts/{attempt}/result`
- History page fetch:
  - `GET /api/my/results`
- Score page render:
  - total_score
  - listening_score
  - structure_score
  - reading_score
  - correct/wrong/unanswered jika boleh tampil.
- Jangan tampilkan kunci jawaban atau pembahasan.

Acceptance criteria:

- Result visibility mengikuti session backend.
- History tidak hardcoded.

## 11. Profile Page

Status: Static.

Task:

- Fetch `GET /api/my/profile`.
- Tampilkan:
  - name
  - email
  - phone
  - institution
  - identity_number
  - account_status.
- Tambahkan update profile jika backend menyediakan endpoint.

Acceptance criteria:

- Profile menampilkan data user login.

## 12. Route Guard

Status: Belum kuat.

Task:

- Public route:
  - `/`
  - `/login`
  - `/register`
  - `/forgot-password`
- Auth route:
  - `/dashboard`
  - `/profile`
  - `/waiting-approval`
  - `/exam/*`
- Jika tidak ada token, redirect login.
- Jika token invalid, clear token.
- Jika account pending, route exam/dashboard redirect status.
- Jika sedang exam, cegah keluar tanpa konfirmasi.

Acceptance criteria:

- User tanpa login tidak bisa akses dashboard/exam.
- User pending tidak bisa start exam.

## 13. State Management

Status: Belum terstruktur.

Task:

- Tentukan state layer:
  - minimal React state + API hooks.
  - atau TanStack Query/SWR jika boleh tambah dependency.
- Simpan auth user dan token.
- Simpan active attempt context.
- Hindari duplicated fetch di banyak page.

Acceptance criteria:

- Data session/profile/attempt tidak inconsistent antar page.

## 14. UI/UX Quality

Status: Visual sudah baik, perlu integrasi state.

Task:

- Loading skeleton di dashboard, history, exam.
- Empty states untuk data kosong.
- Error boundary untuk API failure.
- Responsive check mobile:
  - exam navigator
  - table history
  - forms.
- Accessibility:
  - focus state
  - label/input association
  - aria dialog modal
  - keyboard navigation.
- Arabic typography:
  - Noto Naskh Arabic tetap ada.
  - RTL rendering untuk stem/options Arabic.

Acceptance criteria:

- UI tidak blank saat loading/error.
- Mobile tidak horizontal overflow.

## 15. Testing dan QA

Status: Belum terlihat.

Task:

- Add smoke test manual checklist:
  - register
  - login
  - upload payment
  - dashboard
  - start exam
  - answer/save
  - submit
  - history/result.
- Add component/unit tests jika scope memungkinkan.
- Add Playwright e2e untuk critical flow.
- Test browser refresh di tengah exam.
- Test tab switch/fullscreen logging.

Acceptance criteria:

- Critical user flow bisa diuji ulang sebelum deploy.

## Prioritas Sprint

### P0 - Integrasi Wajib

- Login real API.
- Register real API.
- Route guard.
- Dashboard real API.
- Upload payment proof.
- Start/resume exam.
- Get question/save answer/submit.

### P1 - Exam Reliability

- Heartbeat timer.
- Audio play backend limit.
- Violation logging.
- Result visibility.
- Better error/loading states.

### P2 - Polish

- Better UX for retake.
- Richer history and profile.
- E2E tests.
- Optional notification/status polling.
