// src/stores/search-store.ts
import { create } from "zustand";

export type SearchResultType = {
  id: string;
  name: string;
  description: string;
  language: string;
  tags: string[];
  price: number;
  visibility: BackendVisibility;
};

type SearchStoreType = {
  results: SearchResultType[];
  setResults: (results: SearchResultType[]) => void;
};

export const useSearchStore = create<SearchStoreType>((set) => ({
  results: [],
  setResults: (results) => set({ results }),
}));
