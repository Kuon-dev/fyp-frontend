// src/stores/search-store.ts
import { create } from "zustand";

type SearchResultType = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  language: string;
  visibility: string;
};

type SearchStoreType = {
  results: SearchResultType[];
  setResults: (results: SearchResultType[]) => void;
};

export const useSearchStore = create<SearchStoreType>((set) => ({
  results: [],
  setResults: (results) => set({ results }),
}));
