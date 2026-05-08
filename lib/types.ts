export type ApiStatus = "success" | "error";

export type ApiResponse<T> = {
  code: number;
  status: ApiStatus;
  message: string | null;
  data: T;
};

export type PaginatedData<T> = {
  data: T[];
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
};

export type UserProfile = {
  phone?: string | null;
  institution?: string | null;
  identity_number?: string | null;
  address?: string | null;
};

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "participant" | string;
  account_status: "pending_verification" | "active" | "rejected" | "suspended" | string;
  approved_at?: string | null;
  last_login_at?: string | null;
  profile?: UserProfile | null;
};

export type LoginResponse = {
  user: AuthUser;
  token: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
  institution?: string;
  identity_number?: string;
};

export type RegisterResponse = {
  user: Pick<AuthUser, "id" | "name" | "email" | "account_status">;
};

export type PaymentProof = {
  id: number;
  file_path?: string;
  file_name: string;
  mime_type?: string;
  amount?: number | string | null;
  payment_date?: string | null;
  status: "pending_review" | "approved" | "rejected" | string;
  rejection_reason?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type PaymentProofPayload = {
  file: File;
  amount?: string;
  payment_date?: string;
};
