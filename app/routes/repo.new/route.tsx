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
      <Tabs defaultValue="main" className="">
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
  const [editorValue, handleEditorChange] = useMonacoStore((state) => [
    state.editorValue,
    state.handleEditorChange,
  ]);
  const [cssValue, handleCssChange] = useMonacoStore((state) => [
    state.cssValue,
    state.handleCssChange,
  ]);
  const [renderValue, setRenderValue] = useState(editorValue);
  const editorOptions = useMonacoStore((state) => state.editorOptions);
  const editorRef = useRef<IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    // Remove react import statements
    const importRegex = /^import\s.+?;?\s*$/gm;
    const value = editorValue.replace(importRegex, "").trim();
    // Add import css back
    setRenderValue(`
      injectCSS(cssValue);
      ${value}
    `);
  }, [editorValue, cssValue]);

  const handleEditorBeforeMount = async (monaco: Monaco) => {
    const ts = monaco.languages.typescript;
    ts.typescriptDefaults.setCompilerOptions({
      allowJs: true,
      allowNonTsExtensions: true,
      esModuleInterop: true,
      isolatedModules: true,
      jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
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
    const reactLiveTypes = `declare module 'react-dom' {
      export const render: (props: any) => any;
    }`;
    const reactJSXRuntime = `declare module 'react/jsx-runtime' {
      export default any;
    }`;
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      reactTypes,
      "file:///node_modules/@types/react/index.d.ts",
    );
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      reactLiveTypes,
      "file:///node_modules/@types/react-dom/index.d.ts",
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
                      defaultLanguage={editorOptions.language}
                      defaultValue={editorValue}
                      beforeMount={handleEditorBeforeMount}
                      onChange={(value) => handleEditorChange(value ?? "")}
                      theme={editorOptions.theme}
                      options={{ fontSize: editorOptions.fontSize }}
                      onMount={handleEditorDidMount}
                    />
                  </TabsContent>
                  <TabsContent value="css" className="w-full h-full">
                    <Editor
                      height="100vh"
                      defaultLanguage="css"
                      defaultValue={cssValue}
                      beforeMount={handleEditorBeforeMount}
                      onChange={(value) => handleCssChange(value ?? "")}
                      theme={editorOptions.theme}
                      options={{ fontSize: editorOptions.fontSize }}
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

export function MenubarDemo() {
  const setEditorOptions = useMonacoStore((state) => state.setEditorOptions);

  const handleChangeTheme = (theme: string) => {
    setEditorOptions({ theme });
  };

  const handleChangeFontSize = (fontSize: number) => {
    setEditorOptions({ fontSize });
  };

  const handleChangeLanguage = (language: string) => {
    setEditorOptions({ language });
  };

  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>Editor Options</MenubarTrigger>
        <MenubarContent>
          <MenubarSub>
            <MenubarSubTrigger>Themes</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem onClick={() => handleChangeTheme("vs-dark")}>
                Dark Theme
              </MenubarItem>
              <MenubarItem onClick={() => handleChangeTheme("vs-light")}>
                Light Theme
              </MenubarItem>
              <MenubarItem onClick={() => handleChangeTheme("hc-black")}>
                High Contrast Black
              </MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>Font Sizes</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem onClick={() => handleChangeFontSize(12)}>
                12
              </MenubarItem>
              <MenubarItem onClick={() => handleChangeFontSize(14)}>
                14
              </MenubarItem>
              <MenubarItem onClick={() => handleChangeFontSize(16)}>
                16
              </MenubarItem>
              <MenubarItem onClick={() => handleChangeFontSize(18)}>
                18
              </MenubarItem>
              <MenubarItem onClick={() => handleChangeFontSize(20)}>
                20
              </MenubarItem>
              <MenubarItem onClick={() => handleChangeFontSize(22)}>
                22
              </MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem onClick={() => setEditorOptions({ wordWrap: "on" })}>
            Enable Word Wrap
          </MenubarItem>
          <MenubarItem onClick={() => setEditorOptions({ wordWrap: "off" })}>
            Disable Word Wrap
          </MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>Language</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem onClick={() => handleChangeLanguage("typescript")}>
                TSX
              </MenubarItem>
              <MenubarItem onClick={() => handleChangeLanguage("javascript")}>
                JSX
              </MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}

const injectCSS = (css: string) => {
  const style = document.createElement("style");
  style.type = "text/css";
  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);
};
