// apps/website/src/app/layout.tsx
import "./globals.css";
import { Inter } from "next/font/google";
import Header from "@/_components/Header";
// import ExperienceRouter from "@/_components/ExperienceRouter";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata = {
  title: "PostWins | Deterministic Infrastructure",
  description:
    "Governance engine for global impact infrastructure and transparent humanitarian operations.",
};

/**
 * PRODUCTION-GRADE ROOT LAYOUT
 * Orchestrates:
 * 1. Global Stakeholder Navigation (Header)
 * 2. Deterministic State Steering (ExperienceRouter)
 * 3. Parallel Route Interception (Modal slot)
 */
export default function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} font-sans antialiased bg-slate-950 text-slate-50 selection:bg-blue-500/30`}
      >
        {/* 1. STATE ORCHESTRATOR: Handles persistent stakeholder steering */}
        {/* <ExperienceRouter /> */}

        {/* 2. GLOBAL NAVIGATION: Stakeholder-aware header */}
        <Header />

        {/* 3. MAIN CONTENT: The scrollable marketing & manifesto layers */}
        <main className="relative min-h-screen pt-20">{children}</main>

        {/* 4. MODAL SLOT: For Parallel/Intercepted Experience Survey */}
        <div id="modal-container">{modal}</div>

        {/* 5. PORTAL TARGET: For low-level focus management / accessibility */}
        <div id="modal-root" />
      </body>
    </html>
  );
}
