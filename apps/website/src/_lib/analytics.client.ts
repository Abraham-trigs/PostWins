// apps/website/src/_lib/analytics.client.ts
"use client";

import { useExperienceStore } from "../_store/useExperienceStore";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

/**
 * TELEMETRY DISPATCHER
 * Sends stakeholder intents to the backend ExperienceLog.
 */
export const telemetry = {
  capture: async (event: string, metadata: Record<string, any> = {}) => {
    // 1. Get current stakeholder state from the store
    const { primaryRole, hasCompletedSurvey } = useExperienceStore.getState();

    const payload = {
      event,
      role: primaryRole || "anonymous",
      path: window.location.pathname,
      sessionId: localStorage.getItem("postwins_session_id"), // Persistent ID
      metadata: {
        ...metadata,
        is_complete: hasCompletedSurvey,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
      },
      timestamp: Date.now(),
    };

    try {
      // 2. Fire-and-forget API call
      // We use 'keepalive: true' to ensure the log sends even if the user navigates away
      fetch(`${BACKEND_URL}/api/v1/telemetry/experience`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      });
    } catch (err) {
      // Non-blocking: We don't want analytics to crash the user experience
      console.error("[TELEMETRY_ERROR]", err);
    }
  },
};
