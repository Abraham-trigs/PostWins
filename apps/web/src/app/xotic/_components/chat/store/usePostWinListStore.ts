// apps/web/src/lib/stores/usePostWinListStore.ts
// Purpose: Desktop PostWin list read-model store with abort-safe fetching, debounced search support, and infinite-scroll-ready pagination.

"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { listPostWins } from "@/lib/api/postwins.api";
import type {
  PostWinListItem,
  PostWinLifecycle,
  PaginationMeta,
  ListPostWinsParams,
} from "@/lib/domain/postwin.types";

////////////////////////////////////////////////////////////////
// Types
////////////////////////////////////////////////////////////////

type FetchStatus = "idle" | "loading" | "success" | "error";

/**
 * Normalized internal params.
 * We DO NOT use Required<> because lifecycle is legitimately optional.
 */
type NormalizedParams = {
  page: number;
  pageSize: number;
  search: string;
  lifecycle?: PostWinLifecycle;
};

type State = {
  // Data
  items: PostWinListItem[];
  meta: PaginationMeta;

  // UI state
  selectedId: string | null;
  status: FetchStatus;
  error?: string;

  // Query state
  tenantId: string | null;
  params: NormalizedParams;

  // Infinite scroll state
  isLoadingMore: boolean;

  // Internal
  abortController: AbortController | null;
  lastFetchedAt: string | null;

  /* ---------- lifecycle ---------- */

  initialize: (tenantId: string) => Promise<void>;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;

  /* ---------- query controls ---------- */

  setSearch: (search: string) => Promise<void>;
  setLifecycleFilter: (lifecycle?: PostWinLifecycle) => Promise<void>;
  setPageSize: (pageSize: number) => Promise<void>;

  /* ---------- selection ---------- */

  select: (id: string | null) => void;

  /* ---------- reset ---------- */

  reset: () => void;
};

////////////////////////////////////////////////////////////////
// Defaults
////////////////////////////////////////////////////////////////

function nowIso(): string {
  return new Date().toISOString();
}

const defaultMeta: PaginationMeta = {
  page: 1,
  pageSize: 20,
  total: null,
  hasMore: null,
};

const defaultParams: NormalizedParams = {
  page: 1,
  pageSize: 20,
  search: "",
  lifecycle: undefined, // explicitly allowed
};

////////////////////////////////////////////////////////////////
// Store
////////////////////////////////////////////////////////////////

export const usePostWinListStore = create<State>()(
  devtools(
    (set, get) => ({
      items: [],
      meta: defaultMeta,
      selectedId: null,
      status: "idle",
      error: undefined,
      tenantId: null,
      params: defaultParams,
      isLoadingMore: false,
      abortController: null,
      lastFetchedAt: null,

      /* ---------- lifecycle ---------- */

      initialize: async (tenantId) => {
        if (!tenantId?.trim()) {
          set({ error: "Missing tenantId" });
          return;
        }

        set({ tenantId });
        await get().refetch();
      },

      refetch: async () => {
        const { tenantId, params } = get();
        if (!tenantId) return;

        const existing = get().abortController;
        if (existing) existing.abort();

        const controller = new AbortController();

        set({
          abortController: controller,
          status: "loading",
          error: undefined,
          items: [],
          meta: { ...defaultMeta, page: 1 },
        });

        const result = await listPostWins(
          tenantId,
          { ...params, page: 1 },
          { signal: controller.signal },
        );

        if ("error" in result) {
          set({
            status: "error",
            error:
              typeof result.error === "string"
                ? result.error
                : "Invalid request",
            abortController: null,
          });
          return;
        }

        set({
          items: result.data.items,
          meta: result.data.meta,
          status: "success",
          abortController: null,
          lastFetchedAt: nowIso(),
          params: { ...params, page: 1 },
        });
      },

      loadMore: async () => {
        const { tenantId, meta, params, isLoadingMore } = get();
        if (!tenantId || isLoadingMore) return;
        if (meta.hasMore === false) return;

        set({ isLoadingMore: true });

        const nextPage = meta.page + 1;

        const result = await listPostWins(tenantId, {
          ...params,
          page: nextPage,
        });

        if ("error" in result) {
          set({
            error:
              typeof result.error === "string"
                ? result.error
                : "Failed loading more",
            isLoadingMore: false,
          });
          return;
        }

        set({
          items: [...get().items, ...result.data.items],
          meta: result.data.meta,
          isLoadingMore: false,
          params: { ...params, page: nextPage },
        });
      },

      /* ---------- query controls ---------- */

      setSearch: async (search) => {
        set({
          params: {
            ...get().params,
            search: search.trim(),
            page: 1,
          },
        });
        await get().refetch();
      },

      setLifecycleFilter: async (lifecycle) => {
        set({
          params: {
            ...get().params,
            lifecycle,
            page: 1,
          },
        });
        await get().refetch();
      },

      setPageSize: async (pageSize) => {
        if (pageSize < 1) return;

        set({
          params: {
            ...get().params,
            pageSize,
            page: 1,
          },
        });
        await get().refetch();
      },

      /* ---------- selection ---------- */

      select: (id) => set({ selectedId: id }),

      /* ---------- reset ---------- */

      reset: () =>
        set({
          items: [],
          meta: defaultMeta,
          selectedId: null,
          status: "idle",
          error: undefined,
          tenantId: null,
          params: defaultParams,
          isLoadingMore: false,
          abortController: null,
          lastFetchedAt: null,
        }),
    }),
    { name: "posta-postwin-list-store" },
  ),
);

////////////////////////////////////////////////////////////////
// Design reasoning
////////////////////////////////////////////////////////////////
// Required<> was incorrect because lifecycle is optional by domain definition.
// NormalizedParams reflects runtime truth: lifecycle may be undefined.
// This preserves correct filtering semantics and prevents invalid coercion.

////////////////////////////////////////////////////////////////
// Structure
////////////////////////////////////////////////////////////////
// - Internal NormalizedParams type
// - Explicit optional lifecycle
// - Abort-safe refetch
// - Infinite-scroll-ready loadMore
// - Query state isolated from UI state

////////////////////////////////////////////////////////////////
// Implementation guidance
////////////////////////////////////////////////////////////////
// Keep lifecycle optional in all normalized query layers.
// Do not use Required<> for filter models.
// Wrap setSearch with a debounced input handler (300–500ms).
// When backend adds cursor pagination, swap page-based logic without changing consumers.

////////////////////////////////////////////////////////////////
// Scalability insight
////////////////////////////////////////////////////////////////
// Correct query modeling prevents subtle filtering bugs.
// Optional filters must remain optional across store and API layers.
// Strong internal typing keeps state transitions predictable under scale.
