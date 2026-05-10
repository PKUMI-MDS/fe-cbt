# Panduan Commit — FE-CBT Enhancement

## Rekomendasi Nama Commit

Berikut nama commit yang proper untuk setiap perubahan yang sudah dilakukan:

---

### Commit 1: Account Status Notification
```
feat(waiting-approval): add toast notification and auto-redirect on approval

- Add Toast component integration in WaitingApprovalStatus
- Detect account status transition from pending to active
- Show success toast with celebratory icon
- Auto-redirect to /dashboard with 5-second countdown
- Improve visual states for active, rejected, and pending status
```

---

### Commit 2: Payment Proof UX Enhancement
```
feat(payment-proof): enhance payment proof form with status icons and alerts

- Add status icons (Clock, CheckCircle, XCircle) per payment proof
- Format amount in Indonesian Rupiah (IDR)
- Add rejection alert banner when any proof is rejected
- Improve card styling with color-coded borders
- Add file metadata display (upload date, payment date)
- Smooth "Upload Ulang" scroll-to-form behavior
```

---

### Commit 3: E2E Test Suite
```
test(e2e): add comprehensive playwright test coverage

- Add auth flow tests (login, register, validation)
- Add protected routes tests (middleware redirect behavior)
- Add dashboard tests (404, skeleton, payment form)
- Add exam engine tests (instruction, anti-cheat, waiting-approval)
- Add test helpers for login/logout utilities
- Fix assertions to match HTML5 validation behavior
```

---

### Alternatif: Satu Commit Lengkap

Jika ingin satu commit saja:

```
feat: enhance UX and add E2E test coverage

Account Status:
- Toast notification + auto-redirect on admin approval
- Visual state improvements for pending/active/rejected

Payment Proof:
- Status icons, currency formatting, rejection alerts
- Color-coded cards and improved upload UX

Testing:
- 24 Playwright E2E tests covering auth, routes, exam, dashboard
- Test helpers and HTML5 validation-aware assertions
```

---

## Cara Commit

```bash
# Stage semua perubahan
git add .

# Commit dengan message
git commit -m "feat: enhance UX and add E2E test coverage"

# Atau pakai multi-line commit
git commit -m "feat: enhance UX and add E2E test coverage" -m "" -m "Account Status:" -m "- Toast notification + auto-redirect on admin approval" -m "- Visual state improvements for pending/active/rejected" -m "" -m "Payment Proof:" -m "- Status icons, currency formatting, rejection alerts" -m "- Color-coded cards and improved upload UX" -m "" -m "Testing:" -m "- 24 Playwright E2E tests covering auth, routes, exam, dashboard"
```
