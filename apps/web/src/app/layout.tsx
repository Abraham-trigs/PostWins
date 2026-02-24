// apps/web/src/app/layout.tsx
// Root layout for entire application (global styles + font ownership)

import "./styles/globals.css";
import { Lexend } from "next/font/google";

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-lexend",
  display: "swap",
});

/**
 * Design reasoning:
 * - Only this file may render <html> and <body>.
 * - Font variable must live at the root to avoid hydration mismatch.
 * - Deterministic structure for server/client parity.
 *
 * Structure:
 * - <html>
 *   - <body>
 *     - children
 *
 * Implementation guidance:
 * - Never render <html> or <body> in nested layouts.
 *
 * Scalability insight:
 * - Additional global providers (Theme/Auth/Query) belong here.
 */

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={lexend.variable}>
      <body className="font-sans antialiased min-h-dvh">{children}</body>
    </html>
  );
}
