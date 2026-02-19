// apps/website/src/proxy.ts
// Purpose: Role synchronization + guarded stakeholder routing using Next.js 16 Proxy convention.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PRIMARY_ROLES } from "./_lib/experience.types";

/**
 * Design reasoning:
 * This proxy layer ensures deterministic stakeholder routing across direct URL visits,
 * cookie-based persistence, and cross-app continuity. It keeps UX consistent without
 * trusting client state. Cookies are the source of truth. Redirects are server-enforced.
 *
 * Structure:
 * - proxy(): main request interceptor
 * - Role extraction logic
 * - Redirect enforcement
 * - Context header injection
 * - Route matcher config
 *
 * Implementation guidance:
 * - Drop-in replacement for deprecated middleware.ts
 * - No logic changes required
 * - If cross-subdomain sync is needed, enable cookie domain
 *
 * Scalability insight:
 * If stakeholder permissions expand (RBAC/ABAC), extend this layer to validate
 * allowed route prefixes per role before redirecting. Keep this deterministic.
 */

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  /**
   * 1. Capture role from URL path
   * Example: /experience/donor → "donor"
   */
  const roleFromPath = pathname
    .split("/")
    .find((segment) => PRIMARY_ROLES.includes(segment as any));

  if (roleFromPath) {
    response.cookies.set("postwins_role", roleFromPath, {
      path: "/",
      // domain: ".posta.io", // Enable for cross-subdomain sync (website + web)
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: "lax",
      httpOnly: false, // Required for client-side Zustand hydration
    });
  }

  /**
   * 2. Enforce deterministic experience routing
   */
  const savedRole = request.cookies.get("postwins_role")?.value;

  if (
    pathname.startsWith("/experience/") &&
    savedRole &&
    !pathname.includes(savedRole) &&
    pathname !== "/experience/overview"
  ) {
    return NextResponse.redirect(
      new URL(`/experience/${savedRole}`, request.url),
    );
  }

  /**
   * 3. Telemetry passthrough header
   */
  if (savedRole) {
    response.headers.set("x-stakeholder-role", savedRole);
  }

  return response;
}

/**
 * Ensure proxy only runs on relevant routes.
 * Prevent execution on static assets and API routes.
 */
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
    "/experience/:path*",
  ],
};

/**
 * Example behavior test:
 * - Visit /experience/donor → cookie set
 * - Visit /experience/regulator (cookie donor) → redirected to /experience/donor
 */
