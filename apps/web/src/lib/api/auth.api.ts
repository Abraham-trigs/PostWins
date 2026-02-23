// apps/web/src/lib/api/auth.api.ts
// Purpose: Frontend auth API client aligned with DB-backed kill-switch sessions

export type RequestLoginInput = {
  email: string;
  tenantSlug: string;
};

export type VerifyLoginInput = {
  token: string;
};

type ApiError = {
  ok: false;
  error: string;
};

type ApiSuccess<T = unknown> = {
  ok: true;
} & T;

/**
 * Design reasoning:
 * - All calls use same-origin proxy.
 * - Cookies are HttpOnly; frontend never reads JWT.
 * - 401 may mean expired access token OR revoked session.
 * - We retry once using refresh, then hard-fail.
 *
 * Structure:
 * - requestLogin()
 * - verifyLogin()
 * - refreshSession()
 * - logout()
 * - getCurrentUser()
 * - fetchWithAutoRefresh()
 *
 * Implementation guidance:
 * - Do NOT trust JWT client-side.
 * - Identity must come from /api/auth/me.
 *
 * Scalability insight:
 * - Can later extract fetchWithAutoRefresh into global API layer.
 */

async function handleResponse<T>(res: Response): Promise<ApiSuccess<T>> {
  const data = await res.json();

  if (!res.ok || !data.ok) {
    const message = data?.error || `HTTP ${res.status}`;
    throw new Error(message);
  }

  return data;
}

/**
 * Auto-refresh wrapper:
 * - If request returns 401 → attempt refresh once
 * - If refresh fails → session revoked/expired
 */
async function fetchWithAutoRefresh(
  input: RequestInfo,
  init?: RequestInit,
): Promise<Response> {
  const res = await fetch(input, {
    credentials: "include",
    ...init,
  });

  if (res.status !== 401) return res;

  // Attempt silent refresh
  try {
    await refreshSession();
  } catch {
    // Kill-switch likely triggered
    throw new Error("SESSION_INVALID");
  }

  // Retry original request once
  return fetch(input, {
    credentials: "include",
    ...init,
  });
}

export async function requestLogin(input: RequestLoginInput) {
  const res = await fetch("/api/auth/request-login", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: input.email.trim().toLowerCase(),
      tenantSlug: input.tenantSlug.trim().toLowerCase(),
    }),
  });

  return handleResponse<{ devToken?: string }>(res);
}

export async function verifyLogin(input: VerifyLoginInput) {
  const res = await fetch("/api/auth/verify", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: input.token }),
  });

  return handleResponse(res);
}

export async function refreshSession() {
  const res = await fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "include",
  });

  return handleResponse(res);
}

export async function logout() {
  const res = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });

  return handleResponse(res);
}

/**
 * Source of truth for identity.
 * Never derive from JWT.
 */
export async function getCurrentUser() {
  const res = await fetchWithAutoRefresh("/api/auth/me", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Unauthorized");
  }

  return res.json();
}
