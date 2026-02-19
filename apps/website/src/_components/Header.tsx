// apps/website/src/_components/Header.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useSafeExperienceStore,
  useExperienceStore,
} from "../_store/useExperienceStore";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, RefreshCcw, ArrowRight, Menu, X, LogIn } from "lucide-react";

export default function Header(): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const role = useSafeExperienceStore((s) => s.primaryRole);
  const reset = useExperienceStore((s) => s.reset);

  // Lock scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
  }, [isOpen]);

  useEffect(() => setIsOpen(false), [pathname]);

  const NAV_LINKS = [
    { name: "About", href: "/about" },
    { name: "Architecture", href: "/architecture" },
    { name: "Security", href: "/security" },
    { name: "Impact", href: "/impact" },
  ];

  const handleReset = () => {
    reset();
    router.replace("/");
    setIsOpen(false);
  };

  return (
    <>
      {/* BACKGROUND BLUR OVERLAY */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md">
        <nav className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
          {/* BRAND & DESKTOP NAV */}
          <div className="flex items-center gap-6 lg:gap-12">
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <div className="p-2 bg-blue-600 rounded-lg group-hover:shadow-[0_0_20px_rgba(37,99,235,0.5)] transition-all">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg md:text-xl font-black tracking-tighter text-white uppercase italic">
                PostWins
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[10px] lg:text-xs font-mono uppercase tracking-widest transition-colors ${
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

          {/* ACTIONS AREA */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* LOGIN - THE "MODERN WAY" (Glow & Icon) */}
            <Link
              href="/login"
              className="group flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-white transition-all mr-2"
            >
              <div className="p-1.5 rounded-md group-hover:bg-slate-800 transition-colors">
                <LogIn className="h-4 w-4 group-hover:text-blue-400 transition-colors" />
              </div>
              <span className="hidden sm:inline text-[10px] font-mono uppercase tracking-widest">
                Login
              </span>
            </Link>

            {/* STAKEHOLDER CONTEXT (TABLET+) */}
            <AnimatePresence mode="wait">
              {role && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="hidden lg:flex items-center gap-3 pl-4 border-l border-slate-800"
                >
                  <div className="flex flex-col items-end">
                    <span className="text-[8px] font-mono text-slate-600 uppercase">
                      Perspective
                    </span>
                    <span className="text-xs font-bold text-blue-400 capitalize">
                      {role}
                    </span>
                  </div>
                  <button
                    onClick={handleReset}
                    className="p-1.5 hover:bg-slate-900 rounded-full text-slate-600 hover:text-blue-500"
                  >
                    <RefreshCcw className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* REQUEST DEMO CTA */}
            <Link
              href="/request-demo"
              className="flex items-center gap-2 px-4 md:px-6 py-2.5 bg-blue-600 text-white rounded-full text-[10px] md:text-xs font-bold hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.2)] hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all active:scale-95 whitespace-nowrap"
            >
              <span>Request Demo</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            {/* MOBILE TOGGLE */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </nav>

        {/* MOBILE OVERLAY MENU */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed left-0 right-0 top-20 md:hidden border-b border-slate-800 bg-slate-950/95 backdrop-blur-xl z-50 shadow-2xl"
            >
              <div className="flex flex-col p-8 gap-8">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-lg font-mono uppercase tracking-widest ${
                      pathname === link.href
                        ? "text-blue-500"
                        : "text-slate-400"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}

                <div className="pt-8 border-t border-slate-900 flex flex-col gap-6">
                  {/* MOBILE LOGIN */}
                  <Link
                    href="/login"
                    className="flex items-center gap-3 text-blue-400 font-bold uppercase tracking-widest"
                  >
                    <LogIn className="h-5 w-5" /> Login to Platform
                  </Link>

                  {role && (
                    <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-mono text-slate-600 uppercase italic">
                          Active Role
                        </span>
                        <span className="text-sm font-bold text-white capitalize">
                          {role}
                        </span>
                      </div>
                      <button
                        onClick={handleReset}
                        className="text-blue-500 flex items-center gap-2 text-xs font-bold uppercase"
                      >
                        Reset <RefreshCcw className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
