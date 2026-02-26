// apps/web/src/app/xotic/postwins/_components/chat/store/useCasesStore.ts
import { create } from "zustand";
/**
 * FIXED: Import CaseListItem from our API file to ensure
 * strict alignment with the fetcher logic we just wrote.
 */
import {
  listCases,
  type CaseListItem,
} from "@/lib/api/contracts/domain/cases.api";

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
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
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

      // Safe check for cases array
      const cases = data?.cases || [];

      for (const c of cases) {
        map[c.id] = c;
        ids.push(c.id);
      }

      set({
        byId: map,
        orderedIds: ids,
        /**
         * FIXED: data.nextCursor
         * Aligned with ListCasesResponse and our SSR mock.
         */
        nextCursor: data.meta?.nextCursor ?? null,
        hasMore: Boolean(data.meta?.nextCursor),
        loading: false,
      });
    } catch (e: any) {
      // Don't set error state if it's an AbortError
      if (e.name === "AbortError") return;

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

      const current = { ...get().byId };
      const ids = [...get().orderedIds];
      const cases = data?.cases || [];

      for (const c of cases) {
        if (!current[c.id]) {
          current[c.id] = c;
          ids.push(c.id);
        }
      }

      set({
        byId: current,
        orderedIds: ids,
        nextCursor: data.meta?.nextCursor ?? null,
        hasMore: Boolean(data.meta?.nextCursor),
        loading: false,
      });
    } catch (e: any) {
      if (e.name === "AbortError") return;

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
