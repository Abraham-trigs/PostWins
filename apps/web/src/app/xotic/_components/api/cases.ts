"use client";

export type CaseListItem = {
  id: string;
  status: string;
  routingStatus: string;
  type: string;
  scope: string;
  sdgGoal: string | null;
  summary: string | null;
  createdAt: string;
  updatedAt: string;
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
    // ✅ avoid stale case list in dev/prod when called from client
    cache: "no-store",
  });

  const data = (await res.json()) as any;

  if (!res.ok) {
    throw new Error(data?.error || "Request failed");
  }

  return data as T;
}

export async function listCases(): Promise<{
  ok: true;
  cases: CaseListItem[];
}> {
  return postaGet<{ ok: true; cases: CaseListItem[] }>("/api/cases");
}
