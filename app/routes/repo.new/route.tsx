import { useRef, useState, useEffect } from "react";
import { getHighlighter } from "shiki";
import { injectCSS } from "@/integrations/monaco/inject-css";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
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
import { LiveProvider, LivePreview, LiveError } from "react-live";
import Editor from "@monaco-editor/react";
import type {
  IStandaloneCodeEditor,
  Monaco,
} from "@/integrations/monaco/native.types";
import { Layout, LayoutBody, LayoutHeader } from "@/components/custom/layout";
import { Spinner } from "@/components/custom/spinner";
import { ClientOnly } from "remix-utils/client-only";

// Reusable function to set up LSP for JSX and TSX
const setupLanguageService = async (
  monaco: Monaco,
  language: "javascript" | "typescript",
) => {
  const compilerOptions = {
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
    jsxFactory: "React.createElement",
    jsxFragmentFactory: "React.Fragment",
  };

  const defaults =
    language === "javascript"
      ? monaco.languages.typescript.javascriptDefaults
      : monaco.languages.typescript.typescriptDefaults;

  defaults.setCompilerOptions(compilerOptions);
  defaults.setEagerModelSync(true);

  if (language === "javascript") {
    defaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });
  }

  // Fetch and add React types
  const response = await fetch("https://unpkg.com/@types/react/index.d.ts");
  const reactTypes = await response.text();
  const reactLiveTypes = `declare module 'react-dom' {
    export const render: (props: any) => any;
  }`;
  const reactJSXRuntime = `declare module 'react/jsx-runtime' {
    export default any;
  }`;

  defaults.addExtraLib(
    reactTypes,
    "file:///node_modules/@types/react/index.d.ts",
  );
  defaults.addExtraLib(
    reactLiveTypes,
    "file:///node_modules/@types/react-dom/index.d.ts",
  );
  defaults.addExtraLib(
    reactJSXRuntime,
    "file:///node_modules/@types/react/jsx-runtime/index.d.ts",
  );
};

export default function EditorLayout() {
  return (
    <Layout>
      <Tabs defaultValue="main" className="">
        <LayoutHeader>
          <TabsList className="grid w-[400px] grid-cols-2">
            <TabsTrigger value="main">index</TabsTrigger>
            <TabsTrigger value="css">css</TabsTrigger>
          </TabsList>
          <EditorMenubar />
        </LayoutHeader>
        <LayoutBody>
          <CodeRepoEditorPreview />
        </LayoutBody>
      </Tabs>
    </Layout>
  );
}

function CodeRepoEditorPreview() {
  const [
    editorValue,
    handleEditorChange,
    cssValue,
    handleCssChange,
    editorOptions,
  ] = useMonacoStore((state) => [
    state.editorValue,
    state.handleEditorChange,
    state.cssValue,
    state.handleCssChange,
    state.editorOptions,
  ]);
  const [renderValue, setRenderValue] = useState(editorValue);
  const editorRef = useRef<IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);

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

  useEffect(() => {
    if (editorRef.current && monacoRef.current) {
      const monaco = monacoRef.current;
      const currentValue = editorRef.current.getValue();
      const newModel = monaco.editor.createModel(
        currentValue,
        editorOptions.language,
        monaco.Uri.file(
          editorOptions.language === "javascript" ? "index.jsx" : "index.tsx",
        ),
      );
      editorRef.current.setModel(newModel);
    }
  }, [editorOptions.language]);

  const handleEditorBeforeMount = async (monaco: Monaco) => {
    const highlighter = await getHighlighter({
      themes: ["vitesse-dark", "vitesse-light"],
      langs: ["typescript", "javascript"],
    });
    console.log(highlighter);

    // Set up language services for both JavaScript and TypeScript
    await setupLanguageService(monaco, "javascript");
    await setupLanguageService(monaco, "typescript");
  };

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    const newModel = monaco.editor.createModel(
      editor.getValue(),
      editorOptions.language,
      monaco.Uri.file(
        editorOptions.language === "javascript" ? "index.jsx" : "index.tsx",
      ),
    );
    editor.setModel(newModel);
  };

  const handleEditorCssDidMount: OnMount = (editor, monaco) => {
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
                      language={editorOptions.language}
                      value={editorValue}
                      beforeMount={handleEditorBeforeMount}
                      onChange={(value) => handleEditorChange(value ?? "")}
                      theme={editorOptions.theme}
                      options={{
                        fontSize: editorOptions.fontSize,
                        wordWrap: editorOptions.wordWrap,
                      }}
                      onMount={handleEditorDidMount}
                    />
                  </TabsContent>
                  <TabsContent value="css" className="w-full h-full">
                    <Editor
                      height="100vh"
                      language="css"
                      value={cssValue}
                      beforeMount={handleEditorBeforeMount}
                      onChange={(value) => handleCssChange(value ?? "")}
                      theme={editorOptions.theme}
                      options={{
                        fontSize: editorOptions.fontSize,
                        wordWrap: editorOptions.wordWrap,
                      }}
                      onMount={handleEditorCssDidMount}
                    />
                  </TabsContent>
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={50}>
                <div className="bg-white min-h-screen">
                  <LivePreview className="w-full" />
                  <LiveError className="text-red-800 bg-red-100 mt-2" />
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

export function EditorMenubar() {
  const [editorOptions, setEditorOptions] = useMonacoStore((state) => [
    state.editorOptions,
    state.setEditorOptions,
  ]);

  const handleChangeTheme = (theme: string) => {
    setEditorOptions({ theme });
  };

  const handleChangeFontSize = (fontSize: number) => {
    setEditorOptions({ fontSize });
  };

  const handleChangeLanguage = (language: "javascript" | "typescript") => {
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
              {[12, 14, 16, 18, 20, 22].map((size) => (
                <MenubarItem
                  key={size}
                  onClick={() => handleChangeFontSize(size)}
                >
                  {size}
                </MenubarItem>
              ))}
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
