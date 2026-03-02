"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

type HeadlineSegment = {
  text: string;
  highlight?: boolean;
};

type Stakeholder = {
  role: string;
  headline: HeadlineSegment[];
  subheadline: string;
  theme: string;
};

const STAKEHOLDERS: Stakeholder[] = [
  {
    role: "beneficiaries",
    headline: [
      { text: "Connecting " },
      { text: "Global Donors", highlight: true }, // ← set highlight here
      { text: " to" },
      { text: " grassroots Beneficiaries.", highlight: true },
    ],
    subheadline:
      "shared digital ledger that allows multiple donors to coordinate support around verified educational objectives",
    theme: "#196fd1",
  },

  {
    role: "the human truth",
    headline: [
      { text: "People already  " },
      { text: " share ", highlight: true },
      { text: " when a" },
      { text: " Win", highlight: true },
      { text: " happens" },
    ],
    subheadline:
      " Provide students, Communities, NGO, to have access to directly expose their needs of impact Privately  to Donors and Impact execution bodies  from local and global stakeholders. ",
    theme: "#fb0000",
  },

  {
    role: "communities",
    headline: [
      { text: "Connecting " },
      { text: "Global Donors", highlight: true }, // ← set highlight here
      { text: " to" },
      { text: " grassroots Beneficiaries.", highlight: true },
    ],
    subheadline:
      "shared digital ledger that allows multiple donors to coordinate support around verified educational objectives",
    theme: "#196fd1",
  },

  {
    role: "Donors",
    headline: [
      { text: "Deterministic " },
      { text: "Infrastructure", highlight: true }, // ← set highlight here
      { text: " for Provable Impact" },
    ],
    subheadline: "Every disbursement is linked to authority validation",
    theme: "#fb0000",
  },
  {
    role: "Regulatory Protocol",
    headline: [
      { text: "Policy-Enforced " },
      { text: "Governance", highlight: true }, // ← set highlight here
      { text: " for High-Compliance" },
    ],
    subheadline:
      "Multi-tenant isolation and audit-backed execution for regulatory peace of mind.",
    theme: "#57a07e",
  },
  {
    role: "Operational Velocity",
    headline: [
      { text: "Structured Lifecycle " },
      { text: "Progression", highlight: true }, // ← set highlight here
      { text: " for Velocity" },
    ],
    subheadline:
      "Accelerate case routing and eliminate undocumented decisions.",
    theme: "#bbcfca",
  },
  {
    role: "Technical Architecture",
    headline: [
      { text: "Modular " },
      { text: "Governance Engine", highlight: true }, // ← set highlight here
      { text: " Infrastructure" },
    ],
    subheadline:
      "Prisma + PostgreSQL relational constraints with service-layer orchestration.",
    theme: "#196fd1",
  },
];

export default function WorkspaceWelcome() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % STAKEHOLDERS.length);
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const current = STAKEHOLDERS[index];

  return (
    <main className="relative min-h-screen bg-[#0e0036] text-ink font-sans overflow-hidden flex flex-col transition-colors duration-[2000ms]">
      <nav className="fixed top-0 w-full h-16 md:h-20 border-b border-line bg-paper/60 backdrop-blur-xl z-50 px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="relative h-8 w-8 md:h-10 md:w-10">
            <Image
              src="/postWins_logo_light.svg"
              alt="PostWins"
              width={4051}
              height={4267}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <div className="hidden sm:block h-6 w-px bg-line opacity-30" />
          <span className="text-[15px] md:text-[10px] font-mono uppercase tracking-[0.4em] text-disabled">
            Impact Won, This it.
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="px-2 md:px-3 py-1 rounded-pill border border-line bg-surface-muted/20 flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-state-success animate-pulse" />
            <button className="group relative bg-[#fb0000] hover:brightness-110 text-ink font-bold py-1 md:py- px-4 md:px- rounded-pill shadow-soft transition-all transform hover:scale-[1.02] active:scale-95 text-lg md:text-xl overflow-hidden">
              <div className="absolute inset-0 bg-ark-shimmer opacity-20 group-hover:opacity-40 transition-opacity" />
              <span className="relative z-10">Impact </span>
            </button>

            {/* <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-secondary">
              Hardened
            </span> */}
          </div>
        </div>
      </nav>

      {/* Background Orbs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <motion.div
          animate={{ backgroundColor: current?.theme ?? "#196fd1" }}
          className="absolute -top-40 -left-20 w-[600px] h-[600px] blur-[140px] rounded-full opacity-10 transition-colors duration-[2000ms]"
        />
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, -50, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-surface-secondary/10 blur-[100px] rounded-full"
        />
      </div>

      <div className="flex-grow flex flex-col items-center justify-center relative z-10 px-6 pt-32 md:pt-40">
        <div className="w-full max-w-6xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              className="text-center flex flex-col items-center"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="mb-12 md:mb-16"
              >
                <Image
                  src="/logo_plus_text.svg"
                  alt="PostWins Large"
                  width={200}
                  height={200}
                  className="h-24 md:h-32 w-auto object-contain drop-shadow-[0_0_30px_rgba(25,111,209,0.2)]"
                />
              </motion.div>

              <div className="space-y-6 md:space-y-10">
                <motion.span
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 0.5, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  // transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                  className="text-[10px] md:text-xs font-mono uppercase tracking-[0.6em] text-disabled block"
                >
                  {current?.role ?? "System"}
                </motion.span>

                <motion.h1
                  initial={{ opacity: 0, x: 100, filter: "blur(25px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: -100, filter: "blur(25px)" }}
                  // transition={{
                  //   duration: 1.8,
                  //   ease: [0.16, 1, 0.3, 1],
                  //   delay: 0.2,
                  // }}
                  className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.95] md:leading-[0.9]"
                >
                  {current?.headline.map((segment, i) => (
                    <span
                      key={i}
                      style={
                        segment.highlight ? { color: current.theme } : undefined
                      }
                    >
                      {segment.text}
                    </span>
                  ))}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  // transition={{ duration: 1.4, ease: "easeOut", delay: 0.2 }}
                  className="text-lg md:text-2xl text-secondary max-w-3xl mx-auto leading-relaxed font-medium px-4"
                >
                  {current?.subheadline ?? ""}
                </motion.p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
          className="mt-16 md:mt-24 flex flex-col items-center gap-10"
        >
          {/* <button className="group relative bg-[#fb0000] hover:brightness-110 text-ink font-bold py-5 md:py-6 px-16 md:px-24 rounded-pill shadow-soft transition-all transform hover:scale-[1.02] active:scale-95 text-lg md:text-xl overflow-hidden">
            <div className="absolute inset-0 bg-ark-shimmer opacity-20 group-hover:opacity-40 transition-opacity" />
            <span className="relative z-10">Enter Workspace</span>
          </button> */}

          <div className="flex flex-col items-center gap-6">
            <p className="text-disabled text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] md:tracking-[0.4em] max-w-[280px] md:max-w-[350px] text-center leading-loose opacity-70">
              Go to workspace and keep the records clean for more Wins
            </p>
            <div className="w-16 md:w-24 h-0.5 bg-line rounded-full overflow-hidden">
              <motion.div
                key={index}
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, ease: "linear" }}
                className="h-full bg-ocean"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
