// apps/web/src/app/xotic/_components/chat/api/timeline.ts
"use client";

export type TimelineItem =
  | {
      type: "delivery";
      occurredAt: string;
      deliveryId: string;
      summary: string;
    }
  | {
      type: "followup";
      occurredAt: string;
      followupId: string;
      kind: string;
      deliveryId: string;
    }
  | {
      type: "gap";
      scheduledFor: string;
      deliveryId: string;
      label: string;
      status: "missing" | "upcoming";
      daysFromDelivery: number;
    };

export type TimelineResponse = {
  ok: true;
  projectId: string;
  scheduleDays: number[];
  windowDays: number;
  timeline: TimelineItem[];
  counts: {
    deliveries: number;
    followups: number;
    gaps: number;
    missingGaps: number;
    upcomingGaps: number;
  };
};

function getTenantId(): string {
  const envTenant =
    typeof process !== "undefined"
      ? (process.env.NEXT_PUBLIC_TENANT_ID ?? "")
      : "";

  if (envTenant && envTenant.trim()) return envTenant.trim();

  if (typeof window !== "undefined") {
    const ls = window.localStorage.getItem("posta.tenantId");
    if (ls && ls.trim()) return ls.trim();
  }

  throw new Error(
    "Missing tenantId. Set NEXT_PUBLIC_TENANT_ID or localStorage posta.tenantId",
  );
}

/**
 * Fetch timeline for a project (caseId).
 * Backend: GET /api/timeline/:projectId
 */
export async function fetchTimeline(
  projectId: string,
): Promise<TimelineResponse> {
  if (!projectId?.trim()) {
    throw new Error("Missing projectId");
  }

  const tenantId = getTenantId();

  const res = await fetch(`/api/timeline/${encodeURIComponent(projectId)}`, {
    method: "GET",
    headers: {
      "X-Tenant-Id": tenantId,
      "X-Source": "web",
    },
  });

  const data = (await res.json()) as any;

  if (!res.ok) {
    throw new Error(data?.error || "Timeline fetch failed");
  }

  return data as TimelineResponse;
}
