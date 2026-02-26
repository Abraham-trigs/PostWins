// apps/website/src/app/workspace/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

/**
 * Workspace Welcome - Narrative Engine v2.1
 *
 * Improvements:
 * 1. Slowed rotation to 12 seconds for better absorption.
 * 2. Integrated high-res logo directly above the header content.
 * 3. Staggered sub-elements with longer durations for a "cinematic" feel.
 */

const STAKEHOLDERS = [
  {
    role: "System Overview",
    headline: "Provable Institutional Impact.",
    subheadline:
      "Governance infrastructure that transforms trust into measurable, public progress.",
    theme: "#196fd1",
  },
  {
    role: "Donor Strategy",
    headline: "Deterministic Infrastructure for Provable Impact",
    subheadline:
      "Deliver speed and provable outcomes through policy-enforced workflows.",
    theme: "#05af2c",
  },
  {
    role: "Regulatory Protocol",
    headline: "Policy-Enforced Governance for High-Compliance",
    subheadline:
      "Multi-tenant isolation and audit-backed execution for regulatory peace of mind.",
    theme: "#57a07e",
  },
  {
    role: "Operational Velocity",
    headline: "Structured Lifecycle Progression for Velocity",
    subheadline:
      "Accelerate case routing and eliminate undocumented decisions.",
    theme: "#bbcfca",
  },
  {
    role: "Technical Architecture",
    headline: "Modular Governance Engine Infrastructure",
    subheadline:
      "Prisma + PostgreSQL relational constraints with service-layer orchestration.",
    theme: "#196fd1",
  },
];

export default function WorkspaceWelcome() {
  const [index, setIndex] = useState(0);

  // Slowed rotation: 12 seconds per stakeholder
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % STAKEHOLDERS.length);
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  const current = STAKEHOLDERS[index];

  return (
    <main className="relative min-h-screen bg-paper text-ink font-sans overflow-hidden flex flex-col transition-colors duration-[2000ms]">
      {/* --- TOP BAR --- */}
      <nav className="fixed top-0 w-full h-16 md:h-20 border-b border-line bg-paper/60 backdrop-blur-xl z-50 px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="relative h-8 w-8 md:h-10 md:w-10">
            <Image
              src="/logo_plus_text.svg"
              alt="PostWins"
              width={4051}
              height={4267}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <div className="hidden sm:block h-6 w-px bg-line opacity-30" />
          <span className="text-[8px] md:text-[10px] font-mono uppercase tracking-[0.4em] text-disabled">
            Institutional v2.0
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="px-2 md:px-3 py-1 rounded-pill border border-line bg-surface-muted/20 flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-state-success animate-pulse" />
            <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-secondary">
              Hardened
            </span>
          </div>
        </div>
      </nav>

      {/* --- BACKGROUND ORBS --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <motion.div
          animate={{ backgroundColor: current.theme }}
          className="absolute -top-40 -left-20 w-[600px] h-[600px] blur-[140px] rounded-full opacity-10 transition-colors duration-[2000ms]"
        />
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, -50, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-surface-secondary/10 blur-[100px] rounded-full"
        />
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="flex-grow flex flex-col items-center justify-center relative z-10 px-6 pt-32 md:pt-40">
        <div className="w-full max-w-6xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              className="text-center flex flex-col items-center"
            >
              {/* Central Large Logo Placeholder */}
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
                {/* 1. ROLE TAG */}
                <motion.span
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 0.5, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                  className="text-[10px] md:text-xs font-mono uppercase tracking-[0.6em] text-disabled block"
                >
                  // Protocol: {current.role}
                </motion.span>

                {/* 2. MAIN HEADLINE */}
                <motion.h1
                  initial={{ opacity: 0, x: 100, filter: "blur(25px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: -100, filter: "blur(25px)" }}
                  transition={{
                    duration: 1.8,
                    ease: [0.16, 1, 0.3, 1],
                    delay: 0.4,
                  }}
                  className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.95] md:leading-[0.9] text-ink"
                >
                  {current.headline}
                </motion.h1>

                {/* 3. SUBTEXT */}
                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 1.4, ease: "easeOut", delay: 0.8 }}
                  className="text-lg md:text-2xl text-secondary max-w-3xl mx-auto leading-relaxed font-medium px-4"
                >
                  {current.subheadline}
                </motion.p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* --- ACTION CLUSTER --- */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
          className="mt-16 md:mt-24 flex flex-col items-center gap-10"
        >
          <button className="group relative bg-ocean hover:brightness-110 text-ink font-bold py-5 md:py-6 px-16 md:px-24 rounded-pill shadow-soft transition-all transform hover:scale-[1.02] active:scale-95 text-lg md:text-xl overflow-hidden">
            <div className="absolute inset-0 bg-ark-shimmer opacity-20 group-hover:opacity-40 transition-opacity" />
            <span className="relative z-10">Enter Workspace</span>
          </button>

          <div className="flex flex-col items-center gap-6">
            <p className="text-disabled text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] md:tracking-[0.4em] max-w-[280px] md:max-w-[350px] text-center leading-loose opacity-70">
              Go to workspace and keep the records clean for more Wins
            </p>
            <div className="w-16 md:w-24 h-0.5 bg-line rounded-full overflow-hidden">
              <motion.div
                key={index}
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 12, ease: "linear" }}
                className="h-full bg-ocean"
              />
            </div>
          </div>
        </motion.div>
      </div>

      <footer className="p-8 md:p-10 flex justify-center opacity-30 mt-auto">
        <p className="text-[8px] md:text-[9px] font-mono uppercase tracking-[0.5em] text-disabled text-center">
          Institutional Grade • Security Verified • 2024
        </p>
      </footer>
    </main>
  );
}
