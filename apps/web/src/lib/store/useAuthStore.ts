// apps/web/src/lib/store/useAuthStore.ts
// Purpose: Client-side auth state manager (cookie-backed, identity-aware)

"use client";

import { create } from "zustand";
import {
  requestLogin,
  verifyLogin,
  logout as apiLogout,
  getCurrentUser,
} from "@/lib/api/auth.api";
import type { AuthUser } from "@/lib/api/contracts/domain/auth.types";

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
 * Design evolution:
 * - Cookie-based auth → no token storage.
 * - Identity is fetched via /api/auth/me.
 * - isAuthenticated derived from user presence.
 * - Hydration ensures consistency after refresh.
 *
 * Server remains source of truth.
 */

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

      // DEV MODE shortcut
      if (response.devToken) {
        await verifyLogin({ token: response.devToken });
      }

      // Fetch identity after successful login
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
     HYDRATE (on app boot)
     ============================================================ */
  async hydrate() {
    try {
      const identity = await getCurrentUser();

      set({
        user: identity.user,
        isAuthenticated: true,
        isHydrated: true,
      });
    } catch {
      set({
        user: null,
        isAuthenticated: false,
        isHydrated: true,
      });
    }
  },

  clearError() {
    set({ error: null });
  },
}));
