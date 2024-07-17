import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export type SearchResultType = {
  id: string;
  name: string;
  description: string;
  language: string;
  tags: string[];
  price: number;
  // visibility: BackendVisibility;
};

export type RepoNoSource = Omit<BackendCodeRepo, "sourceJs" | "sourceCss">;

type SearchStoreType = {
  results: RepoNoSource[];
  totalResults: number;
  currentPage: number;
  isLoading: boolean;
  hasMore: boolean;
  searchCriteria: {
    query: string;
    tags: string[];
    language: string;
  };
  setResults: (results: RepoNoSource[]) => void;
  appendResults: (newResults: RepoNoSource[]) => void;
  setTotalResults: (total: number) => void;
  setCurrentPage: (page: number) => void;
  setIsLoading: (isLoading: boolean) => void;
  setHasMore: (hasMore: boolean) => void;
  setSearchCriteria: (
    criteria: Partial<SearchStoreType["searchCriteria"]>,
  ) => void;
  resetSearch: () => void;
};

export const useSearchStore = create<SearchStoreType>()(
  devtools(
    persist(
      immer((set) => ({
        results: [],
        totalResults: 0,
        currentPage: 1,
        isLoading: false,
        hasMore: true,
        searchCriteria: {
          query: "",
          tags: [],
          language: "",
        },
        setResults: (results) => set({ results }),
        appendResults: (newResults) =>
          set((state) => {
            state.results.push(...newResults);
          }),
        setTotalResults: (total) => set({ totalResults: total }),
        setCurrentPage: (page) => set({ currentPage: page }),
        setIsLoading: (isLoading) => set({ isLoading }),
        setHasMore: (hasMore) => set({ hasMore }),
        setSearchCriteria: (criteria) =>
          set((state) => {
            state.searchCriteria = { ...state.searchCriteria, ...criteria };
          }),
        resetSearch: () =>
          set({
            results: [],
            totalResults: 0,
            currentPage: 1,
            hasMore: true,
            searchCriteria: {
              query: "",
              tags: [],
              language: "",
            },
          }),
      })),
      {
        name: "search-store",
        partialize: (state) => ({
          searchCriteria: state.searchCriteria,
        }),
      },
    ),
  ),
);
