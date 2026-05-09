import { clearAuthToken, getAuthToken } from "@/lib/auth";
import type { ApiResponse } from "@/lib/types";

type ApiRequestOptions = Omit<RequestInit, "body" | "headers"> & {
  auth?: boolean;
  body?: unknown;
  headers?: HeadersInit;
};

export class ApiError extends Error {
  code: number;
  response?: ApiResponse<unknown>;
  errors?: Record<string, string[]>;

  constructor(
    message: string,
    code: number,
    response?: ApiResponse<unknown>,
    errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.response = response;
    this.errors = errors;
  }
}

function apiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api").replace(/\/+$/, "");
}

function apiUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  return `${apiBaseUrl()}/${path.replace(/^\/+/, "")}`;
}

type ApiPayload<T> = ApiResponse<T> & {
  errors?: Record<string, string[] | string>;
};

async function parseJson<T>(response: Response): Promise<ApiPayload<T> | null> {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as ApiPayload<T>;
  } catch {
    return null;
  }
}

function buildBody(body: unknown, headers: Headers): BodyInit | undefined {
  if (body === undefined || body === null) return undefined;

  if (body instanceof FormData) {
    return body;
  }

  headers.set("Content-Type", "application/json");
  return JSON.stringify(body);
}

function normalizeErrors(errors?: Record<string, string[] | string>) {
  if (!errors) return undefined;

  return Object.fromEntries(
    Object.entries(errors).map(([field, value]) => [
      field,
      Array.isArray(value) ? value : [value],
    ])
  );
}

// Kata kunci pesan error yang menandakan status akun pending/belum diapprove
const ACCOUNT_STATUS_KEYWORDS = [
  "pending",
  "waiting",
  "approval",
  "not active",
  "not approved",
  "belum aktif",
  "belum disetujui",
  "account is not",
];

function isAccountStatusError(message?: string | null): boolean {
  if (!message) return false;
  const lower = message.toLowerCase();
  return ACCOUNT_STATUS_KEYWORDS.some((kw) => lower.includes(kw));
}

function handleAuthSideEffects(status: number, auth: boolean, message?: string | null) {
  if (typeof window === "undefined") return;

  if (status === 401) {
    clearAuthToken();
    if (window.location.pathname !== "/login") {
      window.location.assign("/login");
    }
  }

  // Hanya redirect 403 ke waiting-approval jika terkait status akun,
  // bukan 403 dari exam engine (session closed, not assigned, dll)
  if (
    auth &&
    status === 403 &&
    isAccountStatusError(message) &&
    window.location.pathname !== "/waiting-approval"
  ) {
    window.location.assign("/waiting-approval");
  }
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}) {
  const { auth = true, body, headers, ...init } = options;
  const requestHeaders = new Headers(headers);

  requestHeaders.set("Accept", "application/json");

  if (auth) {
    const token = getAuthToken();
    if (token) {
      requestHeaders.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(apiUrl(path), {
    ...init,
    body: buildBody(body, requestHeaders),
    headers: requestHeaders,
    cache: init.cache ?? "no-store",
  });

  const payload = await parseJson<T>(response);

  if (!response.ok || payload?.status === "error") {
    handleAuthSideEffects(response.status, auth, payload?.message);

    throw new ApiError(
      payload?.message ?? `Request gagal dengan status ${response.status}`,
      payload?.code ?? response.status,
      payload as ApiResponse<unknown> | undefined,
      normalizeErrors(payload?.errors)
    );
  }

  return payload?.data as T;
}

export const api = {
  get: <T>(path: string, options?: ApiRequestOptions) =>
    apiRequest<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    apiRequest<T>(path, { ...options, method: "POST", body }),
  patch: <T>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    apiRequest<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: ApiRequestOptions) =>
    apiRequest<T>(path, { ...options, method: "DELETE" }),
};
