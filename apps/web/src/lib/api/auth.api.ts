// apps/web/src/lib/api/auth.api.ts
// Purpose: Frontend auth API client aligned with DB-backed kill-switch sessions
// Direct-to-backend transport (no Next proxy)

/**
 * ============================================================================
 * Design reasoning
 * ============================================================================
 * - Frontend must talk directly to backend origin.
 * - Cookies are HttpOnly and scoped to backend.
 * - Never mix origins (prevents tenantId loss).
 * - 401 triggers single refresh retry.
 * - Identity only from /api/auth/me.
 *
 * ============================================================================
 * Structure
 * ============================================================================
 * - Types
 * - Constants
 * - Helpers
 * - fetchWithAutoRefresh()
 * - requestLogin()
 * - verifyLogin()
 * - refreshSession()
 * - logout()
 * - getCurrentUser()
 *
 * ============================================================================
 * Implementation guidance
 * ============================================================================
 * - Ensure backend CORS allows credentials.
 * - Ensure NEXT_PUBLIC_BACKEND_ORIGIN is set.
 * - Do NOT proxy through Next.
 *
 * ============================================================================
 * Scalability insight
 * ============================================================================
 * - Transport layer now origin-consistent.
 * - Safe for multi-tenant + session revocation.
 * - Can be extracted to global fetcher later.
 * ============================================================================
 */

const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN ?? "http://localhost:3001";

/* =========================================================
   Types
========================================================= */

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

/* =========================================================
   Helpers
========================================================= */

async function handleResponse<T>(res: Response): Promise<ApiSuccess<T>> {
  const data = await res.json().catch(() => null);

  if (!res.ok || !data?.ok) {
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
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const url = `${BACKEND_ORIGIN}${path}`;

  const res = await fetch(url, {
    credentials: "include",
    ...init,
  });

  if (res.status !== 401) return res;

  // Attempt silent refresh
  try {
    await refreshSession();
  } catch {
    throw new Error("SESSION_INVALID");
  }

  // Retry original request once
  return fetch(url, {
    credentials: "include",
    ...init,
  });
}

/* =========================================================
   Auth Endpoints
========================================================= */

export async function requestLogin(input: RequestLoginInput) {
  const res = await fetch(`${BACKEND_ORIGIN}/api/auth/request-login`, {
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
  const res = await fetch(`${BACKEND_ORIGIN}/api/auth/verify`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: input.token }),
  });

  return handleResponse(res);
}

export async function refreshSession() {
  const res = await fetch(`${BACKEND_ORIGIN}/api/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });

  return handleResponse(res);
}

export async function logout() {
  const res = await fetch(`${BACKEND_ORIGIN}/api/auth/logout`, {
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

/* =========================================================
   Example Usage
========================================================= */

/*
await requestLogin({ email: "admin@ultra.local", tenantSlug: "ultra-demo" });
await verifyLogin({ token: "dev-token" });

const identity = await getCurrentUser();

await logout();
*/
