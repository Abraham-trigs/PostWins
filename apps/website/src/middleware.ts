// apps/website/src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PRIMARY_ROLES } from "./_lib/experience.types";

/**
 * PRODUCTION-GRADE EXPERIENCE ROUTER (MIDDLEWARE)
 * 1. Syncs Client-side Zustand state to Server-side Cookies.
 * 2. Protects role-specific routes from unauthorized access.
 * 3. Enables Cross-App Persistence for the 'wins' (web) app.
 */
export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const response = NextResponse.next();

  // 1. CAPTURE ROLE FROM URL (e.g., /experience/donor)
  // If the user lands directly on a role page, we "pin" that role to a cookie.
  const roleFromPath = pathname
    .split("/")
    .find((segment) => PRIMARY_ROLES.includes(segment as any));

  if (roleFromPath) {
    response.cookies.set("postwins_role", roleFromPath, {
      path: "/",
      // domain: ".posta.io", // Enable this for cross-subdomain wins/website sync
      maxAge: 60 * 60 * 24 * 30, // 30 Days persistence
      sameSite: "lax",
      httpOnly: false, // Must be false so Zustand can read it on the client
    });
  }

  // 2. REDIRECT LOGIC: Guarding the Experience Routes
  // If a user tries to access /experience/regulator but they are a 'donor'
  // in their cookies, we steer them back to their deterministic path.
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

  // 3. TELEMETRY PASSTHROUGH
  // Add a custom header so the Server Components know the stakeholder context
  if (savedRole) {
    response.headers.set("x-stakeholder-role", savedRole);
  }

  return response;
}

// Ensure middleware only runs on relevant routes to save performance
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
    "/experience/:path*",
  ],
};
