// apps/website/src/_lib/analytics.client.ts
"use client";

import { useExperienceStore } from "../_store/useExperienceStore";

/**
 * Design reasoning:
 * Telemetry must NEVER block UX or throw unhandled rejections.
 * No hardcoded localhost fallback.
 * Analytics is optional infrastructure, not critical path.
 *
 * Structure:
 * - Safe backend resolution
 * - Non-blocking fire-and-forget dispatch
 * - Fully contained error handling
 *
 * Implementation guidance:
 * - Do not await telemetry from UI handlers.
 * - Do not default to localhost.
 * - Use env to explicitly enable telemetry.
 *
 * Scalability insight:
 * In production, route telemetry through an edge collector
 * or internal API route instead of direct backend coupling.
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? null;

export const telemetry = {
  capture: (event: string, metadata: Record<string, any> = {}) => {
    try {
      const { primaryRole, hasCompletedSurvey } = useExperienceStore.getState();

      const payload = {
        event,
        role: primaryRole || "anonymous",
        path: window.location.pathname,
        sessionId:
          localStorage.getItem("postwins_session_id") ?? crypto.randomUUID(),
        metadata: {
          ...metadata,
          is_complete: hasCompletedSurvey,
          viewport: `${window.innerWidth}x${window.innerHeight}`,
        },
        timestamp: Date.now(),
      };

      // If no backend defined → skip safely (dev mode default)
      if (!BACKEND_URL) {
        if (process.env.NODE_ENV === "development") {
          console.debug("[TELEMETRY_SKIPPED_DEV]", payload);
        }
        return;
      }

      // Fire-and-forget dispatch
      fetch(`${BACKEND_URL}/api/v1/telemetry/experience`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch((err) => {
        if (process.env.NODE_ENV === "development") {
          console.debug("[TELEMETRY_NETWORK_FAIL]", err);
        }
      });
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.debug("[TELEMETRY_CAPTURE_FAIL]", err);
      }
    }
  },
};
