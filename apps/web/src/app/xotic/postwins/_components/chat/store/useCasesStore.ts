// apps/web/src/app/xotic/postwins/_components/chat/store/useCasesStore.ts
// Purpose: Cursor-based normalized store powering left case panel

import { create } from "zustand";
import type { CaseListItem } from "@posta/core";
import { listCases } from "@/lib/api/cases.api";

/* ============================================================
   Design reasoning
   ------------------------------------------------------------
   - Normalized state prevents duplication.
   - Cursor-based pagination.
   - Search is debounced at store layer.
   - Infinite-scroll safe.
   - Optimistic-ready structure.
   ============================================================ */

type CasesState = {
  byId: Record<string, CaseListItem>;
  orderedIds: string[];

  nextCursor: string | null;
  limit: number;

  loading: boolean;
  error: string | null;

  search: string;
  hasMore: boolean;

  fetchInitial: () => Promise<void>;
  fetchMore: () => Promise<void>;
  setSearch: (value: string) => void;
  reset: () => void;
};

const DEFAULT_LIMIT = 20;

let debounceTimer: NodeJS.Timeout | null = null;

export const useCasesStore = create<CasesState>((set, get) => ({
  byId: {},
  orderedIds: [],

  nextCursor: null,
  limit: DEFAULT_LIMIT,

  loading: false,
  error: null,

  search: "",
  hasMore: true,

  async fetchInitial() {
    set({
      loading: true,
      error: null,
      byId: {},
      orderedIds: [],
      nextCursor: null,
      hasMore: true,
    });

    try {
      const data = await listCases({
        limit: get().limit,
        search: get().search || undefined,
      });

      const map: Record<string, CaseListItem> = {};
      const ids: string[] = [];

      for (const c of data.cases) {
        map[c.id] = c;
        ids.push(c.id);
      }

      set({
        byId: map,
        orderedIds: ids,
        nextCursor: data.meta.nextCursor,
        hasMore: !!data.meta.nextCursor,
        loading: false,
      });
    } catch (e: any) {
      set({
        loading: false,
        error: e.message ?? "Failed to load cases",
      });
    }
  },

  async fetchMore() {
    if (get().loading || !get().hasMore) return;

    set({ loading: true });

    try {
      const data = await listCases({
        cursor: get().nextCursor,
        limit: get().limit,
        search: get().search || undefined,
      });

      const current = get().byId;
      const ids = [...get().orderedIds];

      for (const c of data.cases) {
        if (!current[c.id]) {
          current[c.id] = c;
          ids.push(c.id);
        }
      }

      set({
        byId: { ...current },
        orderedIds: ids,
        nextCursor: data.meta.nextCursor,
        hasMore: !!data.meta.nextCursor,
        loading: false,
      });
    } catch (e: any) {
      set({
        loading: false,
        error: e.message ?? "Pagination failed",
      });
    }
  },

  setSearch(value: string) {
    set({ search: value });

    if (debounceTimer) clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
      get().fetchInitial();
    }, 300);
  },

  reset() {
    set({
      byId: {},
      orderedIds: [],
      nextCursor: null,
      loading: false,
      error: null,
      hasMore: true,
      search: "",
    });
  },
}));

/* ============================================================
   Structure
   ------------------------------------------------------------
   - Normalized state
   - Cursor tracking
   - Debounced search
   - Infinite scroll fetch
   ============================================================ */

/* ============================================================
   Implementation guidance
   ------------------------------------------------------------
   In left panel component:

     const { orderedIds, byId, fetchMore } = useCasesStore()

   Render:
     orderedIds.map(id => byId[id])

   On scroll bottom:
     fetchMore()

   On search input:
     setSearch(value)
   ============================================================ */

/* ============================================================
   Scalability insight
   ------------------------------------------------------------
   Normalization prevents memory bloat.
   Cursor pagination avoids offset degradation.
   Debounce prevents backend thrashing.
   ============================================================ */
