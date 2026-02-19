// apps/web/src/proxy.ts
// Purpose: Deterministic stakeholder persistence + cross-subdomain routing enforcement (Next 16 Proxy API).

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PRIMARY_ROLES } from "./_lib/experience.types";

/**
 * Design reasoning:
 * This proxy guarantees deterministic stakeholder context across the
 * website + wins applications via shared root-domain cookies.
 * URL role always overrides cookie. Cookie becomes persistent truth.
 * Headers propagate governance mode to server components and telemetry.
 *
 * Structure:
 * - proxy(): request interceptor
 * - URL role extraction
 * - Cookie persistence (cross-subdomain safe)
 * - Deterministic steering logic
 * - Governance header injection
 * - Route matcher
 *
 * Implementation guidance:
 * - Drop-in replacement for deprecated middleware.ts
 * - File must live at src/proxy.ts
 * - Delete old middleware.ts to remove warning
 *
 * Scalability insight:
 * Future RBAC enforcement can extend this layer to validate
 * route-permission matrices instead of simple redirects.
 * Keep cookie as context carrier — never trust client state.
 */

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  /**
   * 1. URL role extraction (URL > Cookie precedence)
   */
  const roleFromPath = pathname
    .split("/")
    .find((segment) => PRIMARY_ROLES.includes(segment as any));

  if (roleFromPath) {
    response.cookies.set("postwins_stakeholder_context", roleFromPath, {
      path: "/",
      domain:
        process.env.NODE_ENV === "production" ? ".postwins.io" : undefined, // localhost cookies should NOT set domain explicitly
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: "lax",
      httpOnly: false, // Required for client hydration
    });
  }

  /**
   * 2. Deterministic steering
   */
  const savedRole = request.cookies.get("postwins_stakeholder_context")?.value;

  if (pathname === "/experience/overview" && savedRole) {
    return NextResponse.redirect(
      new URL(`/experience/${savedRole}`, request.url),
    );
  }

  /**
   * 3. Governance headers
   */
  if (savedRole) {
    response.headers.set("x-postwins-role", savedRole);
    response.headers.set("x-governance-mode", "DETERMINISTIC_ENFORCED");
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

/**
 * Example behavior:
 * - Visit /experience/donor → cookie set on root domain
 * - Visit /experience/overview → redirected to /experience/donor
 * - Headers injected for server component governance awareness
 */
