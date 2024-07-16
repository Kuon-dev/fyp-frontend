import { useRef, useState, useEffect, useCallback } from "react";
import { getHighlighter } from "shiki";
import { injectCSS, injectTailwind } from "@/integrations/monaco/inject-css";
import { toast } from "sonner";
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
import { Button } from "@/components/ui/button";
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
import { Link, useParams } from "@remix-run/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import debounce from "lodash/debounce";

const setupLanguageService = async (monaco: Monaco) => {
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

  // Set up for both JavaScript and TypeScript
  [
    monaco.languages.typescript.javascriptDefaults,
    monaco.languages.typescript.typescriptDefaults,
  ].forEach((defaults) => {
    defaults.setCompilerOptions(compilerOptions);
    defaults.setEagerModelSync(true);
  });

  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  });

  // Fetch and add React types
  const response = await fetch("https://unpkg.com/@types/react/index.d.ts");
  const reactTypes = await response.text();
  const reactLiveTypes = `declare module 'react-dom' {
    export const render: (props: any) => any;
  }`;
  const reactJSXRuntime = `declare module 'react/jsx-runtime' {
    export default any;
  }`;

  [
    monaco.languages.typescript.javascriptDefaults,
    monaco.languages.typescript.typescriptDefaults,
  ].forEach((defaults) => {
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
  });
};

export default function EditorLayout() {
  const { id } = useParams();
  const [isSaving, setIsSaving] = useState(false);
  const { editorOptions } = useMonacoStore();

  const handleSave = async () => {
    if (!id) {
      toast.error("No repo id found");
      return;
    }

    setIsSaving(true);
    const code = localStorage.getItem(`repo_${id}`);
    const css = localStorage.getItem(`repo_${id}_css`);

    try {
      const response = await fetch(
        `${window.ENV.BACKEND_URL}/api/v1/repo/${id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sourceJs: code,
            sourceCss: css,
            language: editorOptions.language === "javascript" ? "JSX" : "TSX",
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to save changes");
      }

      toast.success("Changes saved successfully");
    } catch (error) {
      console.error("Error saving changes:", error);
      toast.error("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Layout>
      <Tabs defaultValue="main" className="">
        <LayoutHeader className="flex flex-col gap-4 justify-start items-start">
          <Link to="/repo">
            <Button>Back</Button>
          </Link>

          <div className="flex flex-row gap-4">
            <TabsList className="grid w-[400px] grid-cols-2">
              <TabsTrigger value="main">index</TabsTrigger>
              <TabsTrigger value="css">css</TabsTrigger>
            </TabsList>
            <EditorMenubar />

            <Button onClick={() => handleSave()} disabled={isSaving}>
              Save
            </Button>
          </div>
        </LayoutHeader>
        <LayoutBody>
          <CodeRepoEditorPreview />
        </LayoutBody>
      </Tabs>
    </Layout>
  );
}

function CodeRepoEditorPreview() {
  const { id } = useParams();
  const {
    editorValue,
    cssValue,
    editorOptions,
    handleEditorChange,
    resetEditorContent,
  } = useMonacoStore();
  const [renderValue, setRenderValue] = useState(editorValue);
  const editorRef = useRef<IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);

  useEffect(() => {
    const importRegex = /^import\s.+?;?\s*$/gm;
    const value = editorValue.replace(importRegex, "").trim();
    setRenderValue(`
      injectCSS(cssValue);
      ${value}
    `);
  }, [editorValue, cssValue]);

  const debouncedHandleEditorChange = useCallback(
    debounce((value: string, language: "javascript" | "typescript" | "css") => {
      handleEditorChange(value, language);
      if (id) {
        localStorage.setItem(
          `repo_${id}${language === "css" ? "_css" : ""}`,
          value,
        );
      }
    }, 500),
    [handleEditorChange, id],
  );

  useEffect(() => {
    if (editorRef.current && monacoRef.current) {
      const monaco = monacoRef.current;
      const editor = editorRef.current;

      const uri = monaco.Uri.file(
        editorOptions.language === "javascript" ? "index.jsx" : "index.tsx",
      );
      let model = monaco.editor.getModel(uri);

      if (!model) {
        model = monaco.editor.createModel(
          editor.getValue(),
          editorOptions.language,
          uri,
        );
      } else {
        monaco.editor.setModelLanguage(model, editorOptions.language);
      }

      editor.setModel(model);
    }
  }, [editorOptions.language]);

  const handleEditorBeforeMount = async (monaco: Monaco) => {
    await getHighlighter({
      themes: ["vitesse-dark", "vitesse-light"],
      langs: ["typescript", "javascript"],
    });
    await setupLanguageService(monaco);
  };

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    const uri = monaco.Uri.file(
      editorOptions.language === "javascript" ? "index.jsx" : "index.tsx",
    );
    let model = monaco.editor.getModel(uri);
    if (!model) {
      model = monaco.editor.createModel(
        editor.getValue(),
        editorOptions.language,
        uri,
      );
    }
    editor.setModel(model);

    if (id) {
      const savedCode = localStorage.getItem(`repo_${id}`);
      if (savedCode) {
        editor.setValue(savedCode);
      }
    }
  };

  const handleEditorCssDidMount: OnMount = (editor, monaco) => {
    const uri = monaco.Uri.file("index.css");
    let model = monaco.editor.getModel(uri);
    if (!model) {
      model = monaco.editor.createModel(editor.getValue(), "css", uri);
    }
    editor.setModel(model);

    if (id) {
      const savedCss = localStorage.getItem(`repo_${id}_css`);
      if (savedCss) {
        editor.setValue(savedCss);
      }
    }
  };

  const handleSubmit = useCallback(
    debounce(() => {
      if (id) {
        const code = localStorage.getItem(`repo_${id}`);
        const css = localStorage.getItem(`repo_${id}_css`);
        console.log("Submitting code:", code);
        console.log("Submitting CSS:", css);
      }
    }, 1000),
    [id],
  );

  useEffect(() => {
    const interval = setInterval(handleSubmit, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [handleSubmit]);

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
                <ScrollArea className="flex min-h-screen h-full items-center justify-center">
                  <TabsContent value="main" className="w-full h-full">
                    <Editor
                      height="100vh"
                      language={editorOptions.language}
                      value={editorValue}
                      beforeMount={handleEditorBeforeMount}
                      onChange={(value) =>
                        debouncedHandleEditorChange(
                          value ?? "",
                          editorOptions.language,
                        )
                      }
                      theme={editorOptions.theme}
                      options={{
                        fontSize: editorOptions.fontSize,
                        wordWrap: editorOptions.wordWrap,
                        minimap: editorOptions.minimap,
                        lineNumbers: editorOptions.lineNumbers,
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
                      onChange={(value) =>
                        debouncedHandleEditorChange(value ?? "", "css")
                      }
                      theme={editorOptions.theme}
                      options={{
                        fontSize: editorOptions.fontSize,
                        wordWrap: editorOptions.wordWrap,
                        minimap: editorOptions.minimap,
                        lineNumbers: editorOptions.lineNumbers,
                      }}
                      onMount={handleEditorCssDidMount}
                    />
                  </TabsContent>
                </ScrollArea>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={50}>
                <div className="bg-slate-950 min-h-screen relative">
                  <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]">
                    <LivePreview className="w-full bg-black" />
                    <LiveError className="text-red-800 bg-red-100 mt-2" />
                  </div>
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
  const {
    editorOptions,
    setEditorOptions,
    toggleMinimap,
    increaseFontSize,
    decreaseFontSize,
  } = useMonacoStore();

  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>Editor Options</MenubarTrigger>
        <MenubarContent>
          <MenubarSub>
            <MenubarSubTrigger>Themes</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem
                onClick={() => setEditorOptions({ theme: "vs-dark" })}
              >
                Dark Theme
              </MenubarItem>
              <MenubarItem
                onClick={() => setEditorOptions({ theme: "vs-light" })}
              >
                Light Theme
              </MenubarItem>
              <MenubarItem
                onClick={() => setEditorOptions({ theme: "hc-black" })}
              >
                High Contrast Black
              </MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>Font Size</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem onClick={increaseFontSize}>
                Increase Font Size
              </MenubarItem>
              <MenubarItem onClick={decreaseFontSize}>
                Decrease Font Size
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
              <MenubarItem
                onClick={() => setEditorOptions({ language: "typescript" })}
              >
                TSX
              </MenubarItem>
              <MenubarItem
                onClick={() => setEditorOptions({ language: "javascript" })}
              >
                JSX
              </MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem onClick={toggleMinimap}>
            {editorOptions.minimap.enabled ? "Disable" : "Enable"} Minimap
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
