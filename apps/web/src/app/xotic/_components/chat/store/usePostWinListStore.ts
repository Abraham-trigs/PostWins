// apps/web/src/lib/stores/usePostWinListStore.ts
// Purpose: Desktop PostWin list read-model store with abort-safe fetching,
// stale-response protection, and infinite-scroll-safe pagination.

"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { listPostWins } from "@/lib/api/postwins.api";
import type {
  PostWinListItem,
  PostWinLifecycle,
  PaginationMeta,
} from "@/lib/domain/postwin.types";

////////////////////////////////////////////////////////////////
// Types
////////////////////////////////////////////////////////////////

type FetchStatus = "idle" | "loading" | "success" | "error";

type NormalizedParams = {
  page: number;
  pageSize: number;
  search: string;
  lifecycle?: PostWinLifecycle;
};

type State = {
  items: PostWinListItem[];
  meta: PaginationMeta;

  selectedId: string | null;
  status: FetchStatus;
  error?: string;

  tenantId: string | null;
  params: NormalizedParams;

  isLoadingMore: boolean;

  abortController: AbortController | null;
  lastFetchedAt: string | null;

  // 🧠 protects against stale responses
  requestKey: string | null;

  initialize: (tenantId: string) => Promise<void>;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;

  setSearch: (search: string) => Promise<void>;
  setLifecycleFilter: (lifecycle?: PostWinLifecycle) => Promise<void>;
  setPageSize: (pageSize: number) => Promise<void>;

  select: (id: string | null) => void;
  reset: () => void;
};

////////////////////////////////////////////////////////////////
// Defaults
////////////////////////////////////////////////////////////////

function nowIso(): string {
  return new Date().toISOString();
}

function makeRequestKey(): string {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

const defaultMeta: PaginationMeta = {
  page: 1,
  pageSize: 20,
  total: null,
  hasMore: false, // safer default
};

const defaultParams: NormalizedParams = {
  page: 1,
  pageSize: 20,
  search: "",
  lifecycle: undefined,
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
      requestKey: null,

      ////////////////////////////////////////////////////////////
      // lifecycle
      ////////////////////////////////////////////////////////////

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
        const requestKey = makeRequestKey();

        set({
          abortController: controller,
          requestKey,
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

        // 🛑 stale protection
        if (get().requestKey !== requestKey) return;

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
        const { tenantId, meta, params, isLoadingMore, status } = get();

        if (!tenantId) return;
        if (isLoadingMore) return;
        if (!meta.hasMore) return; // null and false both block
        if (status !== "success") return;

        const nextPage = meta.page + 1;
        const requestKey = makeRequestKey();

        set({
          isLoadingMore: true,
          requestKey,
        });

        const result = await listPostWins(tenantId, {
          ...params,
          page: nextPage,
        });

        // 🛑 stale protection
        if (get().requestKey !== requestKey) {
          set({ isLoadingMore: false });
          return;
        }

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

      ////////////////////////////////////////////////////////////
      // query controls
      ////////////////////////////////////////////////////////////

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

      ////////////////////////////////////////////////////////////
      // selection
      ////////////////////////////////////////////////////////////

      select: (id) => set({ selectedId: id }),

      ////////////////////////////////////////////////////////////
      // reset
      ////////////////////////////////////////////////////////////

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
          requestKey: null,
        }),
    }),
    { name: "posta-postwin-list-store" },
  ),
);

////////////////////////////////////////////////////////////////
// Design reasoning
////////////////////////////////////////////////////////////////
// Introduced requestKey to prevent stale responses overwriting fresh state.
// Infinite scroll now safe under rapid filter changes.
// hasMore default false prevents accidental uncontrolled loading.

////////////////////////////////////////////////////////////////
// Structure
////////////////////////////////////////////////////////////////
// - requestKey for concurrency safety
// - abort-safe refetch
// - stale-guarded loadMore
// - status-driven pagination control

////////////////////////////////////////////////////////////////
// Implementation guidance
////////////////////////////////////////////////////////////////
// UI should debounce search input (300–500ms).
// When backend supports true cursor pagination,
// replace page logic internally without breaking consumers.

////////////////////////////////////////////////////////////////
// Scalability insight
////////////////////////////////////////////////////////////////
// Stale response protection becomes critical under high latency
// or multi-filter UIs. Without it, list corruption happens silently.
// This store is now safe for real production concurrency.
