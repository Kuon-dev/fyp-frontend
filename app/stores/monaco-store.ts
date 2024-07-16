import { create, StateCreator } from "zustand";
import { persist, PersistOptions } from "zustand/middleware";
import {
  DEFAULT_REACT_MONACO,
  DEFAULT_CSS_MONACO,
} from "@/integrations/monaco/constants";

export type EditorLanguage = "javascript" | "typescript" | "css";
export type EditorTheme = "vs-dark" | "vs-light" | "hc-black";
export type WordWrapSetting = "on" | "off" | "wordWrapColumn" | "bounded";

interface EditorOptions {
  theme: EditorTheme;
  fontSize: number;
  language: EditorLanguage;
  wordWrap: WordWrapSetting;
  minimap: { enabled: boolean };
  lineNumbers: "on" | "off" | "relative";
}

export interface MonacoStoreType {
  editorValue: string;
  cssValue: string;
  editorOptions: EditorOptions;
  handleEditorChange: (value: string, language: EditorLanguage) => void;
  setEditorOptions: (options: Partial<EditorOptions>) => void;
  resetEditorContent: (language: EditorLanguage) => void;
  toggleMinimap: () => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  setEditorValue: (value: string) => void;
  setCssValue: (value: string) => void;
}

const DEFAULT_EDITOR_OPTIONS: EditorOptions = {
  theme: "vs-dark",
  fontSize: 14,
  language: "typescript",
  wordWrap: "on",
  minimap: { enabled: true },
  lineNumbers: "on",
};

type PersistedState = {
  editorOptions: EditorOptions;
};

type MonacoStoreCreator = StateCreator<
  MonacoStoreType,
  [],
  [["zustand/persist", PersistedState]]
>;

const createMonacoStore: MonacoStoreCreator = (set) => ({
  editorValue: "",
  cssValue: "",
  editorOptions: DEFAULT_EDITOR_OPTIONS,
  handleEditorChange: (value: string, language: EditorLanguage) =>
    set(() => {
      if (language === "css") {
        return { cssValue: value };
      }
      return { editorValue: value };
    }),
  setEditorOptions: (options: Partial<EditorOptions>) =>
    set((state) => ({
      editorOptions: { ...state.editorOptions, ...options },
    })),
  resetEditorContent: (language: EditorLanguage) =>
    set(() => {
      if (language === "css") {
        return { cssValue: DEFAULT_CSS_MONACO };
      }
      return { editorValue: DEFAULT_REACT_MONACO };
    }),
  toggleMinimap: () =>
    set((state) => ({
      editorOptions: {
        ...state.editorOptions,
        minimap: { enabled: !state.editorOptions.minimap.enabled },
      },
    })),
  increaseFontSize: () =>
    set((state) => ({
      editorOptions: {
        ...state.editorOptions,
        fontSize: state.editorOptions.fontSize + 1,
      },
    })),
  decreaseFontSize: () =>
    set((state) => ({
      editorOptions: {
        ...state.editorOptions,
        fontSize: Math.max(8, state.editorOptions.fontSize - 1),
      },
    })),
  setEditorValue: (value: string) => set({ editorValue: value }),
  setCssValue: (value: string) => set({ cssValue: value }),
});

const persistOptions: PersistOptions<MonacoStoreType, PersistedState> = {
  name: "monaco-store",
  partialize: (state) => ({
    editorOptions: state.editorOptions,
  }),
};

export const useMonacoStore = create<MonacoStoreType>()(
  persist(createMonacoStore, persistOptions),
);
