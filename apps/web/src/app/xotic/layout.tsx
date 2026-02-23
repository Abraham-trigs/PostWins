// apps/web/src/app/xotic/layout.tsx
// Purpose: Root layout for Xotic section with server-side auth guard

import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { XoticDensityRoot } from "./postwins/_components/layout/XoticDensityRoot";
import { AuthHydrator } from "@/app/xotic/AuthHydrator";
/**
 * Design reasoning:
 * - Guard runs server-side before rendering protected UI.
 * - Prevents hydration flicker.
 * - Uses HttpOnly session cookie.
 * - Does not modify visual structure.
 *
 * Structure:
 * - validateSession()
 * - RootLayout wrapper
 *
 * Implementation guidance:
 * - Relies on /api/auth/me endpoint.
 * - Must use no-store to prevent caching auth state.
 *
 * Scalability insight:
 * - Can extend to role-based routing or tenant enforcement.
 */

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-lexend",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PostWins - Empowering Social Impact through Seamless Connections",
  description:
    "Xotic, Connecting Donors and NGOs to ensure social impact is a byproduct of Progress",
};

async function validateSession(): Promise<boolean> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_ORIGIN}/api/auth/me`,
      {
        cache: "no-store",
        credentials: "include",
      },
    );

    return res.ok;
  } catch {
    return false;
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const valid = await validateSession();

  if (!valid) {
    redirect("/auth/login");
  }

  return (
    <html lang="en" className={lexend.variable} suppressHydrationWarning>
      <body className="font-sans antialiased min-h-dvh overflow-x-hidden">
        <AuthHydrator />
        <XoticDensityRoot>{children}</XoticDensityRoot>
        <AuthHydrator />
      </body>
    </html>
  );
}
