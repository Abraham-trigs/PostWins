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

export async function listCases(): Promise<{
  ok: true;
  cases: CaseListItem[];
}> {
  const tenantId = getTenantId();

  const res = await fetch("/api/cases", {
    method: "GET",
    headers: {
      "X-Tenant-Id": tenantId,
    },
  });

  const data = (await res.json()) as any;

  if (!res.ok) {
    throw new Error(data?.error || "Failed to list cases");
  }

  return data as { ok: true; cases: CaseListItem[] };
}
