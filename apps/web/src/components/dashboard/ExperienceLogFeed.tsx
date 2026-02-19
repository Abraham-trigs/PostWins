// apps/web/src/components/dashboard/ExperienceLogFeed.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  ShieldCheck,
  UserCircle,
  Globe,
  Terminal,
  Eye,
  Zap,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function ExperienceLogFeed() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ["experience-logs"],
    queryFn: async () => {
      const res = await fetch(
        "http://localhost:4000/api/v1/telemetry/experience",
      );
      if (!res.ok) throw new Error("Sync failed");
      return res.json();
    },
    refetchInterval: 3000, // Faster polling for production "Live" feel
  });

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Activity className="text-blue-500 h-5 w-5 animate-pulse" />
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">
            Live Stakeholder Intents
          </h2>
        </div>
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] bg-slate-800/50 px-2 py-1 rounded">
          PostWins v2.0
        </span>
      </div>

      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-slate-500 animate-pulse">
            <Zap className="h-4 w-4" /> Syncing with Governance Engine...
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {logs?.data?.map((log: any) => (
            <motion.div
              key={log.id}
              layout
              initial={{ opacity: 0, x: -10, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="group flex items-start gap-4 p-4 rounded-2xl border border-slate-800 bg-slate-950/40 hover:border-blue-500/30 transition-all shadow-sm"
            >
              {/* Enhanced Icon Mapping for Stakeholder Growth */}
              <div
                className={cn(
                  "p-3 rounded-xl border flex items-center justify-center transition-colors",
                  log.stakeholderRole === "donor" &&
                    "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
                  log.stakeholderRole === "regulator" &&
                    "bg-blue-500/10 border-blue-500/20 text-blue-500",
                  log.stakeholderRole === "operator" &&
                    "bg-orange-500/10 border-orange-500/20 text-orange-500",
                  log.stakeholderRole === "technical" &&
                    "bg-purple-500/10 border-purple-500/20 text-purple-500",
                  log.stakeholderRole === "observer" &&
                    "bg-slate-500/10 border-slate-500/20 text-slate-400",
                )}
              >
                {log.stakeholderRole === "donor" && (
                  <ShieldCheck className="h-5 w-5" />
                )}
                {log.stakeholderRole === "regulator" && (
                  <UserCircle className="h-5 w-5" />
                )}
                {log.stakeholderRole === "operator" && (
                  <Globe className="h-5 w-5" />
                )}
                {log.stakeholderRole === "technical" && (
                  <Terminal className="h-5 w-5" />
                )}
                {log.stakeholderRole === "observer" && (
                  <Eye className="h-5 w-5" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold capitalize text-slate-200 truncate">
                    {log.stakeholderRole}
                  </span>
                  <span className="shrink-0 text-[10px] text-slate-600 font-mono">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 mt-1">
                  <div className="flex items-center gap-1">
                    <Globe className="h-3 w-3" /> {log.path}
                  </div>
                  <div className="flex items-center gap-1 font-mono text-blue-400/80">
                    ID: {log.sessionId?.slice(-6) || "N/A"}
                  </div>
                </div>

                {/* Intent Badges (Lifecycle Law Visibility) */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {log.metadata?.event === "experience_confirmed" && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[9px] font-bold uppercase tracking-wider border border-emerald-500/20">
                      Confirmed Lifecycle
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[9px] font-bold uppercase tracking-wider">
                    {log.metadata?.ab_variant || "Control"}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
