// apps/web/src/app/auth/login/page.tsx
// Purpose: Tenant-scoped passwordless login page with authenticated-user guard

"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/useAuthStore";

/**
 * Assumptions:
 * - isHydrated ensures store has resolved backend session.
 * - isAuthenticated reflects DB-backed session state.
 */

export default function LoginPage() {
  const router = useRouter();

  const { login, loading, error, clearError, isAuthenticated, isHydrated } =
    useAuthStore();

  const [email, setEmail] = useState("");
  const [tenantSlug, setTenantSlug] = useState("");

  /**
   * Redirect if already authenticated
   */
  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.replace("/xotic");
    }
  }, [isHydrated, isAuthenticated, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    clearError();

    await login(email, tenantSlug);

    // Only redirect if auth succeeded
    const { isAuthenticated: authed } = useAuthStore.getState();

    if (authed) {
      router.replace("/xotic");
    }
  }

  // Prevent render flicker while hydrating
  if (!isHydrated) return null;

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-background">
      <div className="w-full max-w-md bg-surface-strong shadow-card rounded-[var(--radius-card)] p-8">
        <h1 className="text-2xl font-semibold text-ink mb-6">
          Sign in to PostWins
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="tenantSlug"
              className="block text-sm text-ink/80 mb-1"
            >
              Tenant Slug
            </label>
            <input
              id="tenantSlug"
              type="text"
              required
              value={tenantSlug}
              onChange={(e) => setTenantSlug(e.target.value)}
              className="w-full h-11 px-4 rounded-[var(--radius-lg)] bg-surface text-ink border border-border focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="ultra-demo"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm text-ink/80 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-4 rounded-[var(--radius-lg)] bg-surface text-ink border border-border focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="admin@ultra.local"
            />
          </div>

          {error && (
            <div className="text-sm text-[var(--state-danger)]">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-[var(--radius-pill)] bg-[var(--brand-primary)] text-ink font-semibold disabled:opacity-60 transition-all"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
