import { api } from "@/lib/api";
import type {
  ActiveAttempt,
  ActiveAttemptResponse,
  AttemptResult,
  AudioPlayResponse,
  AuthUser,
  ExamResult,
  ExamSession,
  ExamSessionRegistration,
  ExamSettings,
  HeartbeatResponse,
  LoginResponse,
  PaginatedData,
  PaymentProof,
  PaymentProofPayload,
  Question,
  RegisterPayload,
  RegisterResponse,
  StartExamResponse,
  TestApproval,
  ViolationPayload,
} from "@/lib/types";

type RecordValue = Record<string, unknown>;

function asRecord(value: unknown): RecordValue {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as RecordValue) : {};
}

function asNumber(value: unknown, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function normalizeAttempt(rawValue: unknown): ActiveAttempt {
  const raw = asRecord(rawValue);
  const pkg = asRecord(raw.package);

  return {
    id: asNumber(raw.id),
    exam_session_id: asNumber(raw.exam_session_id),
    status: asString(raw.status, "in_progress"),
    started_at: asString(raw.started_at, "") || null,
    ends_at: asString(raw.ends_at, "") || null,
    current_question_number: asNumber(raw.current_question_number, 1),
    total_questions: asNumber(raw.total_questions),
    remaining_seconds: asNumber(raw.remaining_seconds),
    // Limit dari exam package — dipakai FE agar sinkron dengan BE
    max_tab_switch: pkg.max_tab_switch !== undefined ? asNumber(pkg.max_tab_switch, 3) : null,
    max_fullscreen_exit: pkg.max_fullscreen_exit !== undefined ? asNumber(pkg.max_fullscreen_exit, 3) : null,
  };
}

function normalizeSession(rawValue: unknown, attempt?: ActiveAttempt): Pick<ExamSession, "id" | "title" | "code"> {
  const raw = asRecord(rawValue);

  return {
    id: asNumber(raw.id, attempt?.exam_session_id ?? 0),
    title: asString(raw.title, "Ujian"),
    code: asString(raw.code, "") || null,
  };
}

function normalizeStartResponse(rawValue: unknown): StartExamResponse {
  const raw = asRecord(rawValue);
  const maybeAttempt = raw.attempt ? asRecord(raw.attempt) : raw;
  const attempt = normalizeAttempt(maybeAttempt);

  return {
    attempt,
    session: normalizeSession(raw.session ?? maybeAttempt.session, attempt),
  };
}

function normalizeQuestion(rawValue: unknown): Question {
  const raw = asRecord(rawValue);
  const snapshot = asRecord(raw.snapshot);
  const options = Array.isArray(raw.options) ? raw.options.map(asRecord) : [];

  return {
    id: asNumber(raw.id),
    question_id: raw.question_id === null || raw.question_id === undefined ? null : asNumber(raw.question_id),
    number: asNumber(raw.display_number ?? raw.number, 1),
    total: asNumber(raw.total ?? raw.total_questions),
    stem_html: asString(raw.stem_html ?? snapshot.stem_html, ""),
    image_url: asString(raw.image_url ?? snapshot.image_url, "") || null,
    audio_url: asString(raw.audio_url ?? snapshot.audio_url, "") || null,
    audio_max_play: asNumber(raw.audio_max_play ?? raw.audio_max_play_count ?? snapshot.audio_max_play_count, 1),
    audio_play_count: asNumber(raw.audio_play_count),
    options: options.map((option) => ({
      id: asNumber(option.id),
      option_key: asString(option.option_key, "") || null,
      option_html: asString(option.option_html, ""),
    })),
    selected_option_id:
      raw.selected_option_id === null || raw.selected_option_id === undefined
        ? null
        : asNumber(raw.selected_option_id),
    is_doubtful: Boolean(raw.is_doubtful),
    section: asString(raw.section ?? snapshot.section, "") || null,
    section_type: asString(raw.section_type ?? snapshot.section_type, "") || null,
  };
}

function normalizeResult(rawValue: unknown): AttemptResult {
  const raw = asRecord(rawValue);
  const result = raw.result === null ? raw : raw.result ? asRecord(raw.result) : raw;
  const metadata = asRecord(result.metadata);
  const showResult = Boolean(result.show_result ?? result.show_result_to_user ?? raw.show_result_to_user ?? raw.result !== null);
  const attemptId = asNumber(result.attempt_id ?? result.exam_attempt_id ?? raw.attempt_id);
  const sessionTitle = asString(result.session_title, "");

  return {
    id: result.id === undefined ? undefined : asNumber(result.id),
    attempt_id: attemptId,
    exam_attempt_id: attemptId || null,
    exam_session_id: result.exam_session_id === undefined ? null : asNumber(result.exam_session_id),
    session_title: sessionTitle || null,
    total_score: result.total_score as AttemptResult["total_score"],
    listening_score: result.listening_score === undefined ? null : asNumber(result.listening_score),
    structure_score: result.structure_score === undefined ? null : asNumber(result.structure_score),
    reading_score: result.reading_score === undefined ? null : asNumber(result.reading_score),
    correct_count: result.correct_count === undefined ? null : asNumber(result.correct_count),
    wrong_count: result.wrong_count === undefined ? null : asNumber(result.wrong_count),
    unanswered_count: result.unanswered_count === undefined ? null : asNumber(result.unanswered_count),
    show_result: showResult,
    show_result_to_user: showResult,
    status: asString(result.status ?? raw.status, "") || null,
    submitted_at: asString(result.submitted_at ?? metadata.submitted_at ?? raw.submitted_at, "") || null,
    created_at: asString(result.created_at ?? metadata.submitted_at ?? raw.submitted_at, "") || null,
    exam_session:
      result.exam_session && typeof result.exam_session === "object"
        ? (result.exam_session as ExamSession)
        : sessionTitle
          ? { id: asNumber(result.exam_session_id), title: sessionTitle }
          : null,
  };
}

function normalizeExamResult(rawValue: unknown): ExamResult {
  const result = normalizeResult(rawValue);

  return {
    id: result.id ?? result.attempt_id,
    exam_attempt_id: result.exam_attempt_id,
    exam_session_id: result.exam_session_id,
    session_title: result.session_title,
    total_score: result.total_score,
    listening_score: result.listening_score,
    structure_score: result.structure_score,
    reading_score: result.reading_score,
    correct_count: result.correct_count,
    wrong_count: result.wrong_count,
    unanswered_count: result.unanswered_count,
    published_at: asString(asRecord(rawValue).published_at, "") || null,
    created_at: result.created_at,
    submitted_at: result.submitted_at,
    show_result_to_user: result.show_result_to_user,
    status: result.status,
    exam_session: result.exam_session,
  };
}

function normalizePaginated<T>(rawValue: unknown, mapper: (item: unknown) => T): PaginatedData<T> {
  const raw = asRecord(rawValue);
  const items = Array.isArray(raw.data) ? raw.data : Array.isArray(rawValue) ? rawValue : [];
  const meta = asRecord(raw.meta);

  return {
    data: items.map(mapper),
    current_page: asNumber(raw.current_page ?? meta.current_page, 1),
    last_page: asNumber(raw.last_page ?? meta.last_page, 1),
    per_page: asNumber(raw.per_page ?? meta.per_page, items.length),
    total: asNumber(raw.total ?? meta.total, items.length),
  };
}

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
  const formData = new FormData();
  formData.set("name", payload.name);
  formData.set("email", payload.email);
  formData.set("password", payload.password);
  formData.set("password_confirmation", payload.password_confirmation);
  if (payload.phone) formData.set("phone", payload.phone);
  if (payload.institution) formData.set("institution", payload.institution);
  if (payload.payment_proof) formData.set("payment_proof", payload.payment_proof);

  return api.post<RegisterResponse>("/register", formData, { auth: false });
}

export function uploadPaymentProof(payload: PaymentProofPayload) {
  const formData = new FormData();
  formData.set("file", payload.file);

  return api.post<PaymentProof>("/payment-proofs", formData);
}

export function getPaymentProofs() {
  return api.get<PaginatedData<PaymentProof>>("/payment-proofs");
}

export function getPaymentProof(id: number | string) {
  return api.get<PaymentProof>(`/payment-proofs/${id}`);
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
  return api.get<unknown>("/my/active-attempt").then((response) => {
    if (!response) return null;
    const raw = response as Record<string, unknown>;
    if (!raw.attempt) return null;
    const attempt = normalizeAttempt(raw.attempt);
    const sessionRaw = raw.session as Record<string, unknown> | undefined;
    return {
      attempt,
      session: {
        id: Number(sessionRaw?.id ?? 0),
        title: String(sessionRaw?.title ?? "Ujian"),
        code: sessionRaw?.code ? String(sessionRaw.code) : null,
      },
    };
  });
}

export function getMyResults() {
  return api
    .get<unknown>("/my/results")
    .then((response) => normalizePaginated(response, normalizeExamResult));
}

export function startExam(sessionId: number) {
  return api
    .post<unknown>(`/exam-sessions/${sessionId}/start`)
    .then(normalizeStartResponse);
}

export function resumeExam(attemptId: number) {
  return api
    .get<unknown>(`/exam-attempts/${attemptId}/resume`)
    .then(normalizeStartResponse);
}

export function getQuestion(attemptId: number, questionNumber: number) {
  return api
    .get<unknown>(`/exam-attempts/${attemptId}/questions/${questionNumber}`)
    .then(normalizeQuestion);
}

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

export function markDoubtful(attemptId: number, questionId: number, isDoubtful: boolean) {
  return api.post<null>(`/exam-attempts/${attemptId}/mark-doubt`, {
    question_id: questionId,
    is_doubtful: isDoubtful,
  });
}

export function navigateQuestion(attemptId: number, targetNumber: number) {
  return api.post<null>(`/exam-attempts/${attemptId}/navigate`, {
    question_number: targetNumber,
  });
}

export function sendHeartbeat(attemptId: number) {
  return api.post<HeartbeatResponse>(`/exam-attempts/${attemptId}/heartbeat`);
}

export function logViolation(attemptId: number, payload: ViolationPayload) {
  return api.post<null>(`/exam-attempts/${attemptId}/violations`, payload);
}

export function logAudioPlay(attemptId: number, questionId: number) {
  return api
    .post<unknown>(`/exam-attempts/${attemptId}/audio-play`, {
      question_id: questionId,
    })
    .then((response): AudioPlayResponse => {
      const raw = asRecord(response);

      return {
        allowed: Boolean(raw.allowed),
        play_count: asNumber(raw.play_count),
        max_play: asNumber(raw.max_play ?? raw.max_play_count, 1),
      };
    });
}

export function submitExam(attemptId: number) {
  return api
    .post<unknown>(`/exam-attempts/${attemptId}/submit`)
    .then(normalizeResult);
}

export function getAttemptResult(attemptId: number) {
  return api
    .get<unknown>(`/exam-attempts/${attemptId}/result`)
    .then(normalizeResult);
}

export function getResultHistory() {
  return api
    .get<unknown>("/my/results")
    .then((response) => normalizePaginated(response, normalizeExamResult));
}

function normalizeExamSettings(rawValue: unknown): ExamSettings {
  const raw = asRecord(rawValue);

  return {
    auto_submit_on_violation_limit: Boolean(raw.auto_submit_on_violation_limit),
    max_tab_switch: asNumber(raw.default_max_tab_switch ?? raw.max_tab_switch, 3),
    max_fullscreen_exit: asNumber(raw.default_max_fullscreen_exit ?? raw.max_fullscreen_exit, 3),
    shuffle_questions: Boolean(raw.default_shuffle_questions ?? raw.shuffle_questions),
    shuffle_options: Boolean(raw.default_shuffle_options ?? raw.shuffle_options),
    show_result_to_user: Boolean(raw.default_show_result_to_user ?? raw.show_result_to_user),
  };
}

export function getExamSettings() {
  return api.get<unknown>("/settings/exam").then(normalizeExamSettings);
}

export function getRegistrationStatus() {
  return api.get<RegistrationStatus>("/settings/registration", { auth: false });
}

export function forgotPassword(payload: { email: string }) {
  return api.post<null>("/forgot-password", payload, { auth: false });
}

export function resetPassword(payload: {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}) {
  return api.post<null>("/reset-password", payload, { auth: false });
}

export function updateProfile(payload: Record<string, string | null>) {
  return api.patch<AuthUser>("/my/profile", payload);
}
