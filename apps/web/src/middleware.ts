// apps/website/src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PRIMARY_ROLES } from "./_lib/experience.types";

/**
 * DETERMINISTIC EXPERIENCE ROUTER (MIDDLEWARE)
 * Enforces Role-Persistence across 'website' and 'wins' subdomains.
 */
export function middleware(request: NextRequest) {
  const { pathname, nextUrl } = request;
  const response = NextResponse.next();

  // 1. ROLE EXTRACTION (URL > Cookie)
  const roleFromPath = pathname
    .split("/")
    .find((s) => PRIMARY_ROLES.includes(s as any));

  if (roleFromPath) {
    // We set the cookie on the root domain to share with 'wins.postwins.io'
    response.cookies.set("postwins_stakeholder_context", roleFromPath, {
      path: "/",
      domain:
        process.env.NODE_ENV === "production" ? ".postwins.io" : "localhost",
      maxAge: 60 * 60 * 24 * 30, // 30 Days
      sameSite: "lax",
      httpOnly: false, // Allow Zustand to hydrate from this on the client
    });
  }

  // 2. DETERMINISTIC STEERING
  const savedRole = request.cookies.get("postwins_stakeholder_context")?.value;

  // If they have a role but are on the generic landing page,
  // we don't force redirect (to allow them to see the Hero),
  // BUT if they hit /experience/overview while having a role, we steer them.
  if (pathname === "/experience/overview" && savedRole) {
    return NextResponse.redirect(
      new URL(`/experience/${savedRole}`, request.url),
    );
  }

  // 3. ARCHITECTURAL HEADERS
  // Inject the role into headers for Server Components / Backend Telemetry
  if (savedRole) {
    response.headers.set("x-postwins-role", savedRole);
    response.headers.set("x-governance-mode", "DETERMINISTIC_ENFORCED");
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
