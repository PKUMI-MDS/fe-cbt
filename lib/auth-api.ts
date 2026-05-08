import { api } from "@/lib/api";
import type {
  AuthUser,
  ActiveAttemptResponse,
  ExamResult,
  ExamSessionRegistration,
  LoginResponse,
  PaymentProof,
  PaymentProofPayload,
  PaginatedData,
  RegisterPayload,
  RegisterResponse,
  TestApproval,
} from "@/lib/types";

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
