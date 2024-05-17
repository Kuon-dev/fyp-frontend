import { create } from "zustand";
import { DEFAULT_REACT_MONACO } from "@/integrations/monaco/constants";
// zustand of monaco editor
//
export type MonacoStoreType = {
  editorValue: string;
  handleEditorChange: (value: string) => void;
};

export const useMonacoStore = create<MonacoStoreType>((set) => ({
  editorValue: DEFAULT_REACT_MONACO,
  handleEditorChange: (value: string) => set({ editorValue: value }),
}));
