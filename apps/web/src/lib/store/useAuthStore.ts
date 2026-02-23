// apps/web/src/lib/store/useAuthStore.ts
// Purpose: Client-side auth state manager aligned with DB-backed kill-switch sessions

"use client";

import { create } from "zustand";
import {
  requestLogin,
  verifyLogin,
  logout as apiLogout,
  getCurrentUser,
} from "@/lib/api/auth.api";
import type { AuthUser } from "@/lib/api/contracts/domain/auth.types";

/**
 * Assumptions:
 * - Backend invalidates sessions via revokedAt.
 * - getCurrentUser() throws on revoked/expired session.
 * - Cookies are HttpOnly; no token stored client-side.
 */

type AuthState = {
  loading: boolean;
  error: string | null;

  isAuthenticated: boolean;
  isHydrated: boolean;

  user: AuthUser | null;

  login: (email: string, tenantSlug: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  clearError: () => void;
};

/**
 * Design reasoning:
 * - Identity comes ONLY from backend.
 * - 401 after refresh = kill-switch → force logout state.
 * - Cross-tab logout via localStorage broadcast.
 * - Hydration is idempotent and safe.
 *
 * Structure:
 * - login()
 * - logout()
 * - hydrate()
 * - clearError()
 *
 * Implementation guidance:
 * - Call hydrate() once in AuthHydrator.
 * - Do not derive identity from JWT.
 *
 * Scalability insight:
 * - Can add WebSocket session revocation push later.
 */

const LOGOUT_EVENT_KEY = "auth:logout";

export const useAuthStore = create<AuthState>((set, get) => ({
  loading: false,
  error: null,

  isAuthenticated: false,
  isHydrated: false,

  user: null,

  /* ============================================================
     LOGIN
  ============================================================ */
  async login(email: string, tenantSlug: string) {
    try {
      set({ loading: true, error: null });

      const response = await requestLogin({
        email,
        tenantSlug,
      });

      // Dev shortcut
      if (response.devToken) {
        await verifyLogin({ token: response.devToken });
      }

      const identity = await getCurrentUser();

      set({
        loading: false,
        isAuthenticated: true,
        user: identity.user,
        isHydrated: true,
      });
    } catch (err: any) {
      set({
        loading: false,
        error: err.message || "Login failed",
        isAuthenticated: false,
      });
    }
  },

  /* ============================================================
     LOGOUT
  ============================================================ */
  async logout() {
    try {
      set({ loading: true, error: null });

      await apiLogout();

      // Broadcast logout to other tabs
      localStorage.setItem(LOGOUT_EVENT_KEY, Date.now().toString());

      set({
        loading: false,
        isAuthenticated: false,
        user: null,
        isHydrated: true,
      });
    } catch (err: any) {
      set({
        loading: false,
        error: err.message || "Logout failed",
      });
    }
  },

  /* ============================================================
     HYDRATE (app boot or 401 recovery)
  ============================================================ */
  async hydrate() {
    // Prevent duplicate hydration
    if (get().isHydrated) return;

    try {
      const identity = await getCurrentUser();

      set({
        user: identity.user,
        isAuthenticated: true,
        isHydrated: true,
      });
    } catch {
      // Kill-switch or expired session
      set({
        user: null,
        isAuthenticated: false,
        isHydrated: true,
      });
    }

    // Cross-tab listener
    if (typeof window !== "undefined") {
      window.addEventListener("storage", (event) => {
        if (event.key === LOGOUT_EVENT_KEY) {
          set({
            user: null,
            isAuthenticated: false,
          });
        }
      });
    }
  },

  clearError() {
    set({ error: null });
  },
}));
