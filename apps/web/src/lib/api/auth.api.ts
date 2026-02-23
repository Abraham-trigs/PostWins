// apps/web/src/lib/api/auth.api.ts
// Purpose: Frontend auth API client for login lifecycle (tenant-scoped passwordless auth)

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
 * - All auth calls use same-origin /api proxy.
 * - credentials: "include" required for cookie transport.
 * - Errors normalized into consistent shape.
 *
 * Structure:
 * - requestLogin()
 * - verifyLogin()
 * - refreshSession()
 * - logout()
 *
 * Implementation guidance:
 * - Works with Next.js rewrite proxy.
 * - Backend must issue HttpOnly cookies.
 *
 * Scalability insight:
 * - Can centralize token refresh logic later via fetch interceptor.
 */

async function handleResponse<T>(res: Response): Promise<ApiSuccess<T>> {
  const data = await res.json();

  if (!res.ok || !data.ok) {
    const message = data?.error || `HTTP ${res.status}`;
    throw new Error(message);
  }

  return data;
}

export async function requestLogin(input: RequestLoginInput) {
  const res = await fetch("/api/auth/request-login", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
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
    headers: {
      "Content-Type": "application/json",
    },
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

export async function getCurrentUser() {
  const res = await fetch("/api/auth/me", {
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Unauthorized");
  }

  return res.json();
}
