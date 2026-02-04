import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import { XoticDensityRoot } from "./xotic/_components/layout/XoticDensityRoot";

import "./styles/globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={lexend.variable} suppressHydrationWarning>
      <body className="font-sans antialiased min-h-dvh overflow-x-hidden">
        <XoticDensityRoot>{children}</XoticDensityRoot>;
      </body>
    </html>
  );
}
