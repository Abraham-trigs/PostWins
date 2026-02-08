import type {
  CaseLifecycle,
  CaseStatus,
  RoutingOutcome,
  CaseType,
  AccessScope,
} from "@prisma/client";

/**
 * Case list item returned by the API.
 *
 * IMPORTANT:
 * - lifecycle is AUTHORITATIVE
 * - status and routingOutcome are advisory / derived
 * - UI must not infer lifecycle from status
 */
export type CaseListItem = {
  id: string;

  /** ✅ Authoritative */
  lifecycle: CaseLifecycle;

  /** ⚠️ Advisory (UI / ops only) */
  status: CaseStatus;

  /** ⚠️ Advisory decision metadata */
  routingOutcome: RoutingOutcome;

  type: CaseType;
  scope: AccessScope;

  sdgGoal: string | null;
  summary: string | null;

  createdAt: string;
  updatedAt: string;
};

/**
 * UI-facing view model.
 * Pure rename for clarity — no data changes.
 */
export type CaseListItemView = CaseListItem & {
  uiStatus: CaseStatus;
  decisionOutcome: RoutingOutcome;
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

async function postaGet<T>(path: string): Promise<T> {
  const tenantId = getTenantId();

  const res = await fetch(path, {
    method: "GET",
    headers: {
      "X-Tenant-Id": tenantId,
    },
    // avoid stale case list in dev/prod when called from client
    cache: "no-store",
  });

  const data = (await res.json()) as unknown;

  if (!res.ok) {
    throw new Error((data as any)?.error ?? "Request failed");
  }

  return data as T;
}

export async function listCases(): Promise<{
  ok: true;
  cases: CaseListItemView[];
}> {
  const res = await postaGet<{ ok: true; cases: CaseListItem[] }>("/api/cases");

  const cases = res.cases.map((c) => {
    // ⚠️ advisory / presentation-only state
    const uiStatus = c.status;

    // ⚠️ decision metadata
    const decisionOutcome = c.routingOutcome;

    return {
      ...c,
      uiStatus,
      decisionOutcome,
    };
  });

  return { ok: true, cases };
}
