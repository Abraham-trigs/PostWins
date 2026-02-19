// apps/website/src/_components/Header.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSafeStore, useExperienceStore } from "../_store/useExperienceStore";
import { motion, AnimatePresence } from "framer-motion";
import { UserCircle, Shield, RefreshCcw, LayoutDashboard } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const role = useSafeStore((s) => s.primaryRole);
  const reset = useExperienceStore((s) => s.reset);

  const NAV_LINKS = [
    { name: "About", href: "/about" },
    { name: "Architecture", href: "/architecture" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md">
      <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* 1. BRAND IDENTITY */}
        <div className="flex items-center gap-12">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-2 bg-blue-600 rounded-lg group-hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter text-white uppercase italic">
              PostWins
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs font-mono uppercase tracking-widest transition-colors ${
                  pathname === link.href
                    ? "text-blue-500"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        {/* 2. STAKEHOLDER CONTEXT INDICATOR */}
        <div className="flex items-center gap-4">
          <AnimatePresence mode="wait">
            {role && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="hidden lg:flex items-center gap-3 pl-4 border-l border-slate-800"
              >
                <div className="flex flex-col items-end">
                  <span className="text-[9px] font-mono text-slate-600 uppercase tracking-tighter">
                    Current Identity
                  </span>
                  <span className="text-xs font-bold text-blue-400 capitalize">
                    {role}
                  </span>
                </div>

                {/* Reset Trigger */}
                <button
                  onClick={() => {
                    reset();
                    window.location.href = "/";
                  }}
                  className="p-2 hover:bg-slate-900 rounded-full text-slate-600 hover:text-blue-500 transition-colors"
                  title="Reset Perspective"
                >
                  <RefreshCcw className="h-4 w-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <Link
            href={
              role ? `https://wins.postwins.io{role}` : "/experience/overview"
            }
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-full text-xs font-bold hover:bg-blue-500 transition-all active:scale-95"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>{role ? "Dashboard" : "Get Started"}</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
