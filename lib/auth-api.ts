import { api } from "@/lib/api";
import type {
  AttemptResult,
  ActiveAttemptResponse,
  AudioPlayResponse,
  AuthUser,
  ExamResult,
  ExamSessionRegistration,
  HeartbeatResponse,
  LoginResponse,
  PaymentProof,
  PaymentProofPayload,
  PaginatedData,
  Question,
  RegisterPayload,
  RegisterResponse,
  StartExamResponse,
  TestApproval,
  ViolationPayload,
} from "@/lib/types";

// ─── Auth ────────────────────────────────────────────────────────────────────

export function loginParticipant(email: string, password: string) {
  return api.post<LoginResponse>("/login", { email, password }, { auth: false });
}

export function getCurrentUser() {
  return api.get<AuthUser>("/me");
}

export function logoutParticipant() {
  return api.post<null>("/logout");
}

export function registerParticipant(payload: RegisterPayload) {
  return api.post<RegisterResponse>("/register", payload, { auth: false });
}

// ─── Payment Proof ───────────────────────────────────────────────────────────

export function uploadPaymentProof(payload: PaymentProofPayload) {
  const formData = new FormData();
  formData.set("file", payload.file);

  if (payload.amount) {
    formData.set("amount", payload.amount);
  }

  if (payload.payment_date) {
    formData.set("payment_date", payload.payment_date);
  }

  return api.post<PaymentProof>("/payment-proofs", formData);
}

export function getPaymentProofs() {
  return api.get<PaginatedData<PaymentProof>>("/payment-proofs");
}

// ─── Participant Data ─────────────────────────────────────────────────────────

export function getMyProfile() {
  return api.get<AuthUser>("/my/profile");
}

export function getMyTestApprovals() {
  return api.get<PaginatedData<TestApproval>>("/my/test-approvals");
}

export function getMyExamSessions() {
  return api.get<PaginatedData<ExamSessionRegistration>>("/my/exam-sessions");
}

export function getActiveAttempt() {
  return api.get<ActiveAttemptResponse>("/my/active-attempt");
}

export function getMyResults() {
  return api.get<PaginatedData<ExamResult>>("/my/results");
}

// ─── Exam Engine ──────────────────────────────────────────────────────────────

/** Mulai ujian baru — membuat attempt baru di backend */
export function startExam(sessionId: number) {
  return api.post<StartExamResponse>(`/exam-sessions/${sessionId}/start`);
}

/** Resume attempt yang sedang aktif */
export function resumeExam(attemptId: number) {
  return api.get<StartExamResponse>(`/exam-attempts/${attemptId}/resume`);
}

/** Ambil soal berdasarkan nomor */
export function getQuestion(attemptId: number, questionNumber: number) {
  return api.get<Question>(`/exam-attempts/${attemptId}/questions/${questionNumber}`);
}

/** Simpan jawaban — question_id adalah exam_attempt_questions.id, selected_option_id adalah question_options.id */
export function saveAnswer(
  attemptId: number,
  questionId: number,
  selectedOptionId: number | null
) {
  return api.post<null>(`/exam-attempts/${attemptId}/answers`, {
    question_id: questionId,
    selected_option_id: selectedOptionId,
  });
}

/** Toggle ragu-ragu — question_id adalah exam_attempt_questions.id */
export function markDoubtful(attemptId: number, questionId: number, isDoubtful: boolean) {
  return api.post<null>(`/exam-attempts/${attemptId}/mark-doubt`, {
    question_id: questionId,
    is_doubtful: isDoubtful,
  });
}

/** Navigasi ke nomor soal tertentu */
export function navigateQuestion(attemptId: number, targetNumber: number) {
  return api.post<null>(`/exam-attempts/${attemptId}/navigate`, {
    question_number: targetNumber,
  });
}

/** Kirim heartbeat timer — kembalikan sisa waktu terkini */
export function sendHeartbeat(attemptId: number) {
  return api.post<HeartbeatResponse>(`/exam-attempts/${attemptId}/heartbeat`);
}

/** Log pelanggaran anti-cheat */
export function logViolation(attemptId: number, payload: ViolationPayload) {
  return api.post<null>(`/exam-attempts/${attemptId}/violations`, payload);
}

/** Log pemutaran audio dan cek apakah masih diizinkan */
export function logAudioPlay(attemptId: number, questionNumber: number) {
  return api.post<AudioPlayResponse>(`/exam-attempts/${attemptId}/audio-play`, {
    question_number: questionNumber,
  });
}

/** Submit ujian secara final */
export function submitExam(attemptId: number) {
  return api.post<AttemptResult>(`/exam-attempts/${attemptId}/submit`);
}

/** Ambil hasil satu attempt */
export function getAttemptResult(attemptId: number) {
  return api.get<AttemptResult>(`/exam-attempts/${attemptId}/result`);
}

/** Riwayat semua hasil ujian peserta */
export function getResultHistory() {
  return api.get<PaginatedData<ExamResult>>("/my/results");
}

