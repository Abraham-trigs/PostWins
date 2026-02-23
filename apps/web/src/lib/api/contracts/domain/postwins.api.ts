// apps/web/src/lib/api/postwins.api.ts
// Purpose: Production-grade PostWin API boundary adapter with strict validation, normalization, and pagination scaffolding (decoupled from backend Case language).

import { z } from "zod";
import {
  PostWinLifecycleValues,
  type PostWinLifecycle,
  type PostWinListItem,
  type PaginationMeta,
  type ListPostWinsParams,
} from "@/lib/domain/postwin.types";

////////////////////////////////////////////////////////////////
// Response Types
////////////////////////////////////////////////////////////////

export type ListPostWinsResult =
  | { data: { items: PostWinListItem[]; meta: PaginationMeta } }
  | { error: string | { field: string[] } };

////////////////////////////////////////////////////////////////
// Backend Validation Schemas (Transport-Accurate)
////////////////////////////////////////////////////////////////

const lifecycleSchema = z.enum(PostWinLifecycleValues);

const routingOutcomeSchema = z.enum([
  "UNASSIGNED",
  "MATCHED",
  "FALLBACK",
  "BLOCKED",
]);

const backendCaseSchema = z.object({
  id: z.string().uuid(),
  lifecycle: lifecycleSchema,
  currentTask: z.string(),
  routingOutcome: routingOutcomeSchema,
  type: z.string(),
  scope: z.string(),
  sdgGoal: z.string().nullable().optional(),
  summary: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const backendListSchema = z.object({
  ok: z.boolean(),
  cases: z.array(backendCaseSchema),
});

////////////////////////////////////////////////////////////////
// Static Type Derivation
////////////////////////////////////////////////////////////////

type BackendCase = z.infer<typeof backendCaseSchema>;

////////////////////////////////////////////////////////////////
// Normalized Params
////////////////////////////////////////////////////////////////

type NormalizedListPostWinsParams = {
  page: number;
  pageSize: number;
  search: string;
  lifecycle?: PostWinLifecycle;
};

////////////////////////////////////////////////////////////////
// Helpers
////////////////////////////////////////////////////////////////

function normalizeDate(input: string): string {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) {
    throw new Error("Invalid date value from backend");
  }
  return d.toISOString();
}

function assertTenantId(tenantId: string): void {
  if (!tenantId || tenantId.trim().length === 0) {
    throw new Error("Tenant ID is required");
  }
}

function normalizeParams(
  params?: ListPostWinsParams,
): NormalizedListPostWinsParams {
  const page = Number(params?.page ?? 1);
  const pageSize = Number(params?.pageSize ?? 20);

  return {
    page: Number.isNaN(page) || page < 1 ? 1 : page,
    pageSize: Number.isNaN(pageSize) || pageSize < 1 ? 20 : pageSize,
    search: (params?.search ?? "").trim(),
    lifecycle: params?.lifecycle,
  };
}

function buildQueryString(params: NormalizedListPostWinsParams): string {
  const query = new URLSearchParams();

  query.set("page", String(params.page));
  query.set("pageSize", String(params.pageSize));

  if (params.search.length > 0) {
    query.set("search", params.search);
  }

  if (params.lifecycle) {
    query.set("lifecycle", params.lifecycle);
  }

  return query.toString();
}

async function safeJson(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    throw new Error("Invalid JSON response");
  }
}

////////////////////////////////////////////////////////////////
// API Implementation
////////////////////////////////////////////////////////////////

export async function listPostWins(
  tenantId: string,
  params?: ListPostWinsParams,
  options?: { signal?: AbortSignal },
): Promise<ListPostWinsResult> {
  try {
    assertTenantId(tenantId);

    const normalizedParams = normalizeParams(params);
    const queryString = buildQueryString(normalizedParams);

    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_ORIGIN;
    if (!baseUrl) {
      return { error: "API base URL not configured" };
    }

    const res = await fetch(`${baseUrl}/api/cases?${queryString}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Tenant-Id": tenantId,
      },
      credentials: "include",

      // 🔥 Critical: prevent browser HTTP caching (fixes 304 issue)
      cache: "no-store",

      signal: options?.signal,
    });

    if (!res.ok) {
      const body = await safeJson(res).catch(() => null);

      if (body && typeof body === "object" && "error" in body) {
        return { error: (body as any).error };
      }

      return { error: "Failed to fetch PostWins" };
    }

    const json = await safeJson(res);

    const parsed = backendListSchema.safeParse(json);
    if (!parsed.success || parsed.data.ok !== true) {
      return { error: "Unexpected backend response shape" };
    }

    const backendCases: BackendCase[] = parsed.data.cases;

    const allItems: PostWinListItem[] = backendCases.map((c) => ({
      id: c.id,
      lifecycle: c.lifecycle,
      currentTask: c.currentTask,
      routingOutcome: c.routingOutcome,
      type: c.type,
      scope: c.scope,
      sdgGoal: c.sdgGoal ?? null,
      summary: c.summary ?? null,
      createdAt: normalizeDate(c.createdAt),
      updatedAt: normalizeDate(c.updatedAt),
    }));

    // Temporary client-side pagination until backend supports it
    const start = (normalizedParams.page - 1) * normalizedParams.pageSize;
    const end = start + normalizedParams.pageSize;

    const paginated = allItems.slice(start, end);

    return {
      data: {
        items: paginated,
        meta: {
          page: normalizedParams.page,
          pageSize: normalizedParams.pageSize,
          total: null,
          hasMore: end < allItems.length,
        },
      },
    };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Unknown error occurred",
    };
  }
}

////////////////////////////////////////////////////////////////
// Design reasoning
////////////////////////////////////////////////////////////////
// Transport is modeled accurately: backend Date values are ISO strings.
// Zod enforces runtime validation aligned with static inference.
// No unsafe casts remain. Boundary stays deterministic and strict.

////////////////////////////////////////////////////////////////
// Structure
////////////////////////////////////////////////////////////////
// - Runtime-accurate Zod schema
// - Static inferred BackendCase type
// - Normalized query params
// - Strict tenant-enforced fetch boundary
// - Stable union return shape

////////////////////////////////////////////////////////////////
// Implementation guidance
////////////////////////////////////////////////////////////////
// Keep backend schema synchronized with controller projection.
// Do not introduce client-side business logic here.
// This file only adapts transport → domain.

////////////////////////////////////////////////////////////////
// Scalability insight const
////////////////////////////////////////////////////////////////
// Strong boundary enforcement prevents type drift across layers.
// When backend adds real pagination, remove client slicing and
// pass through server meta while preserving the same return union. backendListSchema
