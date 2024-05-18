import { useRef, useState, useEffect } from "react";
// import { useDebounce } from '@/hooks/useDebounce';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useMonacoStore } from "@/stores/monaco-store";
import type { OnMount } from "@monaco-editor/react";
import { LiveProvider, LivePreview } from "react-live";
import Editor from "@monaco-editor/react";
// import MonacoEditor from '@/integrations/monaco/monaco';
import type {
  IStandaloneCodeEditor,
  Monaco,
} from "@/integrations/monaco/types";
let isHydrating = true;

export default function Index() {
  const [editorValue, setEditorValue] = useMonacoStore((state) => [
    state.editorValue,
    state.handleEditorChange,
  ]);
  const [renderValue, setRenderValue] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);
  const editorRef = useRef<IStandaloneCodeEditor | null>(null);
  // const debouncedValue = useDebounce(editorValue, 500)
  useEffect(() => {
    // remove react import statements
    const importRegex = /^import\s.+?;?\s*$/gm;
    const value = editorValue.replace(importRegex, "").trim();
    setRenderValue(value);
  }, [editorValue]);

  useEffect(() => {
    // append tailwind cdn script if not already present on header
    // <script src="https://cdn.tailwindcss.com"></script>
    // if (document.querySelector("script[src='https://cdn.tailwindcss.com']")) return;
    // const head = document.head;
    // const script = document.createElement("script");
    // script.src = "https://cdn.tailwindcss.com";
    // head?.insertBefore(script, head.firstChild);
  }, []);

  const handleEditorBeforeMount = async (monaco: Monaco) => {
    const ts = monaco.languages.typescript;
    ts.typescriptDefaults.setCompilerOptions({
      allowJs: true,
      allowNonTsExtensions: true,
      esModuleInterop: true,
      isolatedModules: true,
      jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
      jsxEmit: "react",
      // jsx: "react",
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      noEmit: true,
      skipLibCheck: true,
      target: monaco.languages.typescript.ScriptTarget.Latest,
      typeRoots: ["node_modules/@types"],
      jsxFactory: "react",
    });

    ts.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });
    monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
    const response = await fetch("https://unpkg.com/@types/react/index.d.ts");
    const reactTypes = await response.text();
    const reactLiveTypes = `delcare module 'react-live' {
      export const render: (props: any) => any
    `;
    const reactJSXRuntime = `declare module 'react/jsx-runtime' {
      export default any
    }`;
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      reactTypes,
      "file:///node_modules/@types/react/index.d.ts",
    );
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      reactLiveTypes,
      "file:///node_modules/@types/react-live/index.d.ts",
    );
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      reactJSXRuntime,
      "file:///node_modules/@types/react/jsx-runtime/index.d.ts",
    );
  };

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    const newModel = monaco.editor.createModel(
      editor.getValue(),
      "typescript",
      monaco.Uri.file("index.tsx"),
    );
    editor.setModel(newModel);
  };

  useEffect(() => {
    if (isHydrating) {
      isHydrating = false;
      setIsHydrated(true);
    }
  }, []);

  return (
    <div className="w-full h-full">
      <LiveProvider code={renderValue} noInline>
        <ResizablePanelGroup
          direction="horizontal"
          className="rounded-lg border"
        >
          <ResizablePanel defaultSize={50}>
            <div className="flex min-h-screen h-full items-center justify-center">
              {isHydrated && (
                <Editor
                  height="100vh"
                  defaultLanguage="typescript"
                  defaultValue={editorValue}
                  beforeMount={handleEditorBeforeMount}
                  onChange={(value) => setEditorValue(value ?? "")}
                  theme="vs-dark"
                  onMount={handleEditorDidMount}
                />
              )}
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50}>
            <div className="bg-white min-h-screen">
              <LivePreview className="w-full" />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </LiveProvider>
    </div>
  );
}

export function ResizableDemo() {
  return;
}
