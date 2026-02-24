// apps/web/src/app/auth/login/page.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/useAuthStore";

/**
 * LoginPage: Tenant-scoped passwordless login.
 *
 * FIX: The redirect gate now checks for result.ok because the
 * backend response stores the tenantId inside an HttpOnly cookie
 * rather than returning it in the JSON body.
 */
export default function LoginPage() {
  const router = useRouter();
  const { login, loading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState("");
  const [tenantSlug, setTenantSlug] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    clearError();

    try {
      // 1. Trigger login. Expecting { ok: true, devToken: "...", ... }
      const result = await login(email, tenantSlug);

      // 2. Access the latest state
      const state = useAuthStore.getState();

      // 3. UPDATED GATE:
      // Since the backend response is { ok: true }, we trigger the transition
      // if the response confirms success OR the store is authenticated.
      if (result?.ok || state.isAuthenticated) {
        router.push("/postwins");
      } else {
        console.warn("Login response received but transition blocked:", result);
      }
    } catch (err) {
      console.error("Login submission error:", err);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-background">
      <div className="w-full max-w-md bg-surface-strong shadow-card rounded-[var(--radius-card)] p-8 border border-line/40">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-ink tracking-tight">
            Sign in to PostWins
          </h1>
          <p className="text-sm text-ink/50 mt-1">
            Enter your details to access your workspace.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="tenantSlug"
              className="block text-xs font-bold uppercase tracking-widest text-ink/60 mb-2"
            >
              Tenant Slug
            </label>
            <input
              id="tenantSlug"
              type="text"
              required
              value={tenantSlug}
              onChange={(e) => setTenantSlug(e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-surface text-ink border border-line/60 focus:outline-none focus:ring-2 focus:ring-ocean/20 focus:border-ocean/40 transition-all"
              placeholder="e.g. ultra-demo"
              autoComplete="organization"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-xs font-bold uppercase tracking-widest text-ink/60 mb-2"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-surface text-ink border border-line/60 focus:outline-none focus:ring-2 focus:ring-ocean/20 focus:border-ocean/40 transition-all"
              placeholder="admin@ultra.local"
              autoComplete="email"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red/5 border border-red/20 text-xs font-semibold text-red animate-in fade-in slide-in-from-top-1">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full h-12 rounded-full bg-ink text-paper font-bold overflow-hidden transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 shadow-xl shadow-ink/10"
          >
            <div className="relative z-10 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-paper/30 border-t-paper rounded-full animate-spin" />
                  <span>Signing in…</span>
                </>
              ) : (
                <span>Continue to Dashboard</span>
              )}
            </div>
            <div className="absolute inset-0 bg-ocean opacity-0 group-hover:opacity-10 transition-opacity" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-line/20 text-center">
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-ink/30">
            Powered by PostWins Infrastructure
          </p>
        </div>
      </div>
    </div>
  );
}
