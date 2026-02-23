// apps/web/src/app/auth/login/page.tsx
// Purpose: Tenant-scoped passwordless login page (dev-mode auto verify)

"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/useAuthStore";

/**
 * Design reasoning:
 * - Minimal surface.
 * - Uses existing theme tokens only.
 * - Mobile-first centered layout.
 * - No external state beyond auth store.
 * - Accessible form structure.
 *
 * Structure:
 * - LoginPage component
 * - Controlled inputs
 * - Submit handler
 *
 * Implementation guidance:
 * - Redirect to /xotic after login.
 * - Replace dev auto-verify later with email flow.
 *
 * Scalability insight:
 * - Can later split tenantSlug into subdomain detection.
 * - Can integrate rate-limit feedback.
 */

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState("");
  const [tenantSlug, setTenantSlug] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    clearError();

    await login(email, tenantSlug);

    // optimistic redirect — backend is source of truth
    router.push("/xotic");
  }

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
