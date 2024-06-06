import * as MonacoTypes from "monaco-editor";

export type Monaco = typeof MonacoTypes;
export type IStandaloneCodeEditor = MonacoTypes.editor.IStandaloneCodeEditor;
// export type ICodeEditorViewState = MonacoTypes.editor.ICodeEditorViewState;
// export type IStandaloneEditorConstructionOptions =
//   MonacoTypes.editor.IStandaloneEditorConstructionOptions;
// export type IModelContentChangedEvent =
//   MonacoTypes.editor.IModelContentChangedEvent;
export type TypeScriptWorker =
  MonacoTypes.languages.typescript.TypeScriptWorker;
export type TypeScriptDiagnostic = MonacoTypes.languages.typescript.Diagnostic;
export type DiagnosticMessageChain =
  MonacoTypes.languages.typescript.DiagnosticMessageChain;

export type IKeyboardEvent = MonacoTypes.IKeyboardEvent;
export interface MonacoContext {
  deps: NodeModuleDep[];
  loader: Promise<Monaco> | null;
  tsWorker: null | TypeScriptWorker;
}

export interface NodeModuleDep {
  pkgName: string;
  pkgPath: string;
  pkgVersion: string;
  path: string;
  code?: string;
  promise?: Promise<void>;
}
