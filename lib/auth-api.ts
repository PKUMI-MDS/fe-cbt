import { api } from "@/lib/api";
import type {
  AuthUser,
  LoginResponse,
  PaymentProof,
  PaymentProofPayload,
  RegisterPayload,
  RegisterResponse,
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
