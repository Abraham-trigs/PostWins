// apps/web/src/app/xotic/layout.tsx
// Purpose: Server-side protected layout with reliable cookie forwarding and zero flicker auth guard (Next 15 compatible)

import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { XoticDensityRoot } from "./postwins/_components/layout/XoticDensityRoot";
import AuthHydrator from "./AuthHydrator";

/**
 * Assumptions:
 * - Backend validates DB-backed session via authMiddleware.
 * - /api/auth/me returns 401 if session revoked/expired.
 * - Root layout owns <html> and font variable.
 */

export const metadata: Metadata = {
  title: "PostWins - Empowering Social Impact through Seamless Connections",
  description:
    "Xotic, Connecting Donors and NGOs to ensure social impact is a byproduct of Progress",
};

/**
 * Design reasoning:
 * - Layout-level guard prevents UI flicker.
 * - No <html> or <body> here (App Router rule).
 * - Server validation ensures redirect before render.
 *
 * Structure:
 * - validateSession()
 * - Protected layout wrapper
 *
 * Scalability insight:
 * - Can add role-based redirects here.
 * - Can add tenant scoping validation here.
 */

async function validateSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();

    const cookieHeader = cookieStore
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_ORIGIN}/api/auth/me`,
      {
        cache: "no-store",
        headers: {
          cookie: cookieHeader,
        },
      },
    );

    return res.ok;
  } catch {
    return false;
  }
}

export default async function XoticLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const valid = await validateSession();

  if (!valid) {
    redirect("/auth/login");
  }

  return (
    <div className="overflow-x-hidden">
      <AuthHydrator />
      <XoticDensityRoot>{children}</XoticDensityRoot>
    </div>
  );
}
