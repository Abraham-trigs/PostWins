/**
 * ============================================================================
 * File: apps/web/src/lib/api/apiClient.ts
 * Purpose: Centralized Axios transport layer with:
 * - Tenant header injection
 * - Single-flight refresh rotation
 * - 401 retry logic
 * - Cookie-based session support
 * ============================================================================
 */

import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosInstance,
} from "axios";
import { useAuthStore } from "@/lib/store/useAuthStore";

/* =========================================================
   Backend Configuration
========================================================= */

const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN ?? "http://localhost:3001";

/* =========================================================
   Clean Auth Handshake Client
   - No interceptors
   - Used ONLY for /auth/* endpoints
========================================================= */

export const authHandshakeClient: AxiosInstance = axios.create({
  baseURL: `${BACKEND_ORIGIN}/api`,
  withCredentials: true,
});

/* =========================================================
   Single-Flight Refresh State
========================================================= */

let refreshPromise: Promise<void> | null = null;

/* =========================================================
   Standard API Client
   - Used by all feature modules
========================================================= */

export const apiClient: AxiosInstance = axios.create({
  baseURL: `${BACKEND_ORIGIN}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/* =========================================================
   Request Interceptor
   Inject tenant header deterministically.
========================================================= */

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const { tenantId, isHydrated } = useAuthStore.getState();

  if (isHydrated && tenantId && config.headers) {
    config.headers["x-tenant-id"] = tenantId;
  }

  return config;
});

/* =========================================================
   Response Interceptor
   Handles 401 → refresh → retry
========================================================= */

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Only handle expired access token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!refreshPromise) {
        refreshPromise = useAuthStore.getState().hydrate(true);
      }

      try {
        await refreshPromise;
        refreshPromise = null;

        // Retry original request with fresh cookies
        return apiClient(originalRequest);
      } catch (refreshError) {
        refreshPromise = null;

        // Hard logout if refresh fails
        useAuthStore.getState().logout();

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
