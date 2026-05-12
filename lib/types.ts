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
};

export type RegisterResponse = {
  user: Pick<AuthUser, "id" | "name" | "email" | "account_status">;
};

export type PaymentProof = {
  id: number;
  file_path?: string;
  file_name: string;
  mime_type?: string;
  status: "pending_review" | "approved" | "rejected" | string;
  rejection_reason?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type PaymentProofPayload = {
  file: File;
};

export type TestApproval = {
  id: number;
  approval_code?: string | null;
  status: "active" | "used" | "expired" | "revoked" | string;
  quota_total?: number | null;
  quota_used?: number | null;
  notes?: string | null;
  approved_at?: string | null;
  created_at?: string | null;
  payment_proof?: PaymentProof | null;
};

export type ExamPackage = {
  id: number;
  code?: string | null;
  title?: string | null;
  description?: string | null;
  duration_minutes?: number | null;
};

export type ExamSession = {
  id: number;
  code?: string | null;
  title: string;
  description?: string | null;
  session_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  duration_minutes?: number | null;
  status?: string | null;
  show_result_to_user?: boolean;
  exam_package?: ExamPackage | null;
};

export type ExamSessionRegistration = {
  id: number;
  registration_status?: string | null;
  assignment_type?: string | null;
  assigned_at?: string | null;
  notes?: string | null;
  exam_session?: ExamSession | null;
};

export type ActiveAttempt = {
  id: number;
  exam_session_id: number;
  status: string;
  started_at?: string | null;
  ends_at?: string | null;
  current_question_number?: number | null;
  total_questions?: number | null;
  remaining_seconds?: number | null;
};

export type ActiveAttemptResponse = {
  attempt: ActiveAttempt;
  session: Pick<ExamSession, "id" | "title" | "code">;
} | null;

export type ExamResult = {
  id: number;
  exam_attempt_id?: number | null;
  exam_session_id?: number | null;
  session_title?: string | null;
  total_score?: number | string | null;
  correct_count?: number | null;
  wrong_count?: number | null;
  unanswered_count?: number | null;
  published_at?: string | null;
  created_at?: string | null;
  submitted_at?: string | null;
  show_result_to_user?: boolean;
  status?: string | null;
  exam_session?: ExamSession | null;
};

export type QuestionOption = {
  id: number;
  option_key?: string | null;
  option_html?: string | null;
  image_url?: string | null;
  audio_url?: string | null;
};

export type Question = {
  id: number;
  question_id?: number | null;
  number: number;
  total: number;
  stem_html?: string | null;
  image_url?: string | null;
  audio_url?: string | null;
  audio_max_play?: number | null;
  audio_play_count?: number | null;
  options: QuestionOption[];
  selected_option_id?: number | null;
  is_doubtful?: boolean;
  section?: string | null;
  section_type?: string | null;
};

export type StartExamResponse = {
  attempt: ActiveAttempt;
  session: Pick<ExamSession, "id" | "title" | "code">;
};

export type HeartbeatResponse = {
  remaining_seconds: number;
  status: string;
};

export type AudioPlayResponse = {
  allowed: boolean;
  play_count: number;
  max_play: number;
};

export type ViolationPayload = {
  violation_type:
    | "tab_switch"
    | "fullscreen_exit"
    | "right_click"
    | "copy_attempt"
    | "multi_login_attempt"
    | "suspicious_disconnect";
  severity?: "low" | "medium" | "high";
  detail?: string;
};

export type AttemptResult = {
  id?: number;
  attempt_id: number;
  exam_attempt_id?: number | null;
  exam_session_id?: number | null;
  session_title?: string | null;
  total_score?: number | string | null;
  correct_count?: number | null;
  wrong_count?: number | null;
  unanswered_count?: number | null;
  show_result?: boolean;
  show_result_to_user?: boolean;
  status?: string | null;
  submitted_at?: string | null;
  created_at?: string | null;
  exam_session?: ExamSession | null;
};

export type ExamSettings = {
  auto_submit_on_violation_limit: boolean;
  max_tab_switch: number;
  max_fullscreen_exit: number;
  shuffle_questions: boolean;
  shuffle_options: boolean;
  show_result_to_user: boolean;
};
