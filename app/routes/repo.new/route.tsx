import { useRef, useState, useEffect } from "react";
// import { useDebounce } from '@/hooks/useDebounce';
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useMonacoStore } from "@/stores/monaco-store";
import type { OnMount } from "@monaco-editor/react";
import { LiveProvider, LivePreview } from "react-live";
import Editor from "@monaco-editor/react";
// import MonacoEditor from '@/integrations/monaco/monaco';
import type {
  IStandaloneCodeEditor,
  Monaco,
} from "@/integrations/monaco/types";
import { DEFAULT_CSS_MONACO } from "@/integrations/monaco/constants";
import { Layout, LayoutBody, LayoutHeader } from "@/components/custom/layout";
import { Spinner } from "@/components/custom/spinner";
import { ClientOnly } from "remix-utils/client-only";

export default function EditorLayout() {
  return (
    <Layout>
      <Tabs defaultValue="account" className="">
        <LayoutHeader>
          <TabsList className="grid w-[400px] grid-cols-2">
            <TabsTrigger value="main">index</TabsTrigger>
            <TabsTrigger value="css">css</TabsTrigger>
          </TabsList>
          <MenubarDemo />
        </LayoutHeader>
        <LayoutBody>
          <CodeRepoEditorPreview />
        </LayoutBody>
      </Tabs>
    </Layout>
  );
}

function CodeRepoEditorPreview() {
  const [editorValue, setEditorValue] = useMonacoStore((state) => [
    state.editorValue,
    state.handleEditorChange,
  ]);
  const [renderValue, setRenderValue] = useState("");
  const [cssValue, setCssValue] = useState(DEFAULT_CSS_MONACO);
  const editorRef = useRef<IStandaloneCodeEditor | null>(null);
  // const debouncedValue = useDebounce(editorValue, 500)
  useEffect(() => {
    // remove react import statements
    const importRegex = /^import\s.+?;?\s*$/gm;
    const value = editorValue.replace(importRegex, "").trim();
    // add import css back
    setRenderValue(`
      injectCSS(cssValue);
      ${value}
      `);
  }, [editorValue, cssValue]);

  useEffect(() => {}, []);

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

  const handleEditorCssDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    const newModel = monaco.editor.createModel(
      editor.getValue(),
      "css",
      monaco.Uri.file("index.css"),
    );
    editor.setModel(newModel);
  };

  return (
    <div className="w-full h-full">
      <LiveProvider code={renderValue} noInline scope={{ injectCSS, cssValue }}>
        <ClientOnly fallback={<MonacoLoading />}>
          {() => (
            <ResizablePanelGroup
              direction="horizontal"
              className="rounded-lg border"
            >
              <ResizablePanel defaultSize={50}>
                <div className="flex min-h-screen h-full items-center justify-center">
                  <TabsContent value="main" className="w-full h-full">
                    <Editor
                      height="100vh"
                      defaultLanguage="typescript"
                      defaultValue={editorValue}
                      beforeMount={handleEditorBeforeMount}
                      onChange={(value) => setEditorValue(value ?? "")}
                      theme="vs-dark"
                      onMount={handleEditorDidMount}
                    />
                  </TabsContent>
                  <TabsContent value="css" className="w-full h-full">
                    <Editor
                      height="100vh"
                      defaultLanguage="css"
                      defaultValue={cssValue}
                      beforeMount={handleEditorBeforeMount}
                      onChange={(value) => setCssValue(value ?? "")}
                      theme="vs-dark"
                      onMount={handleEditorCssDidMount}
                    />
                  </TabsContent>
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={50}>
                <div className="bg-white min-h-screen">
                  <LivePreview className="w-full" />
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          )}
        </ClientOnly>
      </LiveProvider>
    </div>
  );
}

function MonacoLoading() {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <Spinner />
    </div>
  );
}

function MenubarDemo() {
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            New Tab <MenubarShortcut>⌘T</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            New Window <MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled>New Incognito Window</MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>Share</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>Email link</MenubarItem>
              <MenubarItem>Messages</MenubarItem>
              <MenubarItem>Notes</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem>
            Print... <MenubarShortcut>⌘P</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            Undo <MenubarShortcut>⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>Find</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>Search the web</MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Find...</MenubarItem>
              <MenubarItem>Find Next</MenubarItem>
              <MenubarItem>Find Previous</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem>Cut</MenubarItem>
          <MenubarItem>Copy</MenubarItem>
          <MenubarItem>Paste</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}

const CSSInjector = ({ css }: { css: string }) => {
  useEffect(() => {
    const style = document.createElement("style");
    style.type = "text/css";
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);

    // Cleanup function to remove the style tag when the component unmounts
    return () => {
      document.head.removeChild(style);
    };
  }, [css]);

  return null;
};

const injectCSS = (css: string) => {
  const style = document.createElement("style");
  style.type = "text/css";
  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);
};
