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

  /**
   * tenantId: The "Source of Truth" for the Server-side guard.
   * Survives the 15m ACCESS_TTL by re-syncing from the 7-day REFRESH_TTL cookie.
   */
  tenantId: string | null;
  user: AuthUser | null;

  login: (email: string, tenantSlug: string) => Promise<{ ok: boolean }>;
  logout: () => Promise<void>;
  hydrate: (force?: boolean) => Promise<void>;
  clearError: () => void;
};

const LOGOUT_EVENT_KEY = "auth:logout";

export const useAuthStore = create<AuthState>((set, get) => ({
  loading: false,
  error: null,

  isAuthenticated: false,
  isHydrated: false,
  tenantId: null,
  user: null,

  /* ============================================================
     LOGIN: Establishes the 7-day Session
  ============================================================ */
  async login(email: string, tenantSlug: string) {
    try {
      set({ loading: true, error: null });

      const response = await requestLogin({ email, tenantSlug });

      if (response.devToken) {
        await verifyLogin({ token: response.devToken });
      }

      // Sync identity immediately to get the DB-backed tenantId
      const identity = await getCurrentUser();

      set({
        loading: false,
        isAuthenticated: true,
        user: identity.user,
        tenantId: identity.user?.tenantId || tenantSlug, // Fallback to slug if ID not yet in user record
        isHydrated: true,
      });

      return { ok: true };
    } catch (err: any) {
      set({
        loading: false,
        error: err.message || "Login failed",
        isAuthenticated: false,
        tenantId: null,
      });
      return { ok: false };
    }
  },

  /* ============================================================
     LOGOUT: Revokes 7-day Session & 15m Access
  ============================================================ */
  async logout() {
    try {
      set({ loading: true, error: null });
      await apiLogout();

      if (typeof window !== "undefined") {
        localStorage.setItem(LOGOUT_EVENT_KEY, Date.now().toString());
      }

      set({
        loading: false,
        isAuthenticated: false,
        user: null,
        tenantId: null,
        isHydrated: true,
      });
    } catch (err: any) {
      set({ loading: false, error: err.message || "Logout failed" });
    }
  },

  /* ============================================================
     HYDRATE: The 15m/7d Safety Net
     Called on app boot and after 401 token expiration.
  ============================================================ */
  async hydrate(force = false) {
    // If already hydrated and not forced, skip to avoid UI flickers
    if (get().isHydrated && !force) return;

    try {
      // Hits the server with the 7-day HttpOnly cookie
      const identity = await getCurrentUser();

      set({
        user: identity.user,
        tenantId: identity.user?.tenantId || null,
        isAuthenticated: true,
        isHydrated: true,
      });
    } catch {
      // 401 or network error = Session Revoked
      set({
        user: null,
        tenantId: null,
        isAuthenticated: false,
        isHydrated: true,
      });
    }

    // Cross-tab Synchronization
    if (typeof window !== "undefined") {
      window.addEventListener("storage", (event) => {
        if (event.key === LOGOUT_EVENT_KEY) {
          set({ user: null, tenantId: null, isAuthenticated: false });
        }
      });
    }
  },

  clearError() {
    set({ error: null });
  },
}));
