const AUTH_TOKEN_KEY = "cbt_participant_token";
const AUTH_COOKIE_KEY = "cbt_participant_token";

export function getAuthToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

function setAuthCookie(token: string) {
  if (typeof window === "undefined") return;
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${AUTH_COOKIE_KEY}=${encodeURIComponent(token)}; expires=${expires}; path=/; SameSite=Lax`;
}

function clearAuthCookie() {
  if (typeof window === "undefined") return;
  document.cookie = `${AUTH_COOKIE_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export function setAuthToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  setAuthCookie(token);
}

export function clearAuthToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  clearAuthCookie();
}

export function hasAuthToken() {
  return Boolean(getAuthToken());
}

export function getAuthorizationHeader() {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
