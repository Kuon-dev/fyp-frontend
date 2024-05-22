import { create } from "zustand";
import {
  DEFAULT_REACT_MONACO,
  DEFAULT_CSS_MONACO,
} from "@/integrations/monaco/constants";

export type MonacoStoreType = {
  editorValue: string;
  handleEditorChange: (value: string) => void;
  cssValue: string;
  handleCssChange: (value: string) => void;
  editorOptions: {
    theme: string;
    fontSize: number;
    language: "javascript" | "typescript";
  };
  setEditorOptions: (
    options: Partial<{ theme: string; fontSize: number }>,
  ) => void;
};

export const useMonacoStore = create<MonacoStoreType>((set) => ({
  editorValue: DEFAULT_REACT_MONACO,
  handleEditorChange: (value: string) => set({ editorValue: value }),
  editorOptions: {
    theme: "vs-dark",
    fontSize: 14,
    language: "typescript",
  },
  cssValue: DEFAULT_CSS_MONACO,
  handleCssChange: (value: string) => set({ cssValue: value }),
  setEditorOptions: (options) =>
    set((state) => ({
      editorOptions: { ...state.editorOptions, ...options },
    })),
}));
