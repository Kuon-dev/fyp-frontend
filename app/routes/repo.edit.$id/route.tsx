import { useRef, useState, useEffect, useCallback } from "react";
import { getHighlighter } from "shiki";
import { injectCSS } from "@/integrations/monaco/inject-css";
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

import debounce from "lodash/debounce";

// Reusable function to set up LSP for JSX and TSX
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
  const [editorOptions] = useMonacoStore((state) => [state.editorOptions]);

  const handleSave = async () => {
    if (!id) {
      toast.error("no repo id found");
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

      const result = await response.json();
      toast.success("Changes saves successfully");
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

  const debouncedHandleEditorChange = useCallback(
    debounce((value: string) => {
      handleEditorChange(value);
      // Save to localStorage
      if (id) {
        localStorage.setItem(`repo_${id}`, value);
      }
    }, 500),
    [handleEditorChange, id],
  );

  const debouncedHandleCssChange = useCallback(
    debounce((value: string) => {
      handleCssChange(value);
      // Save to localStorage
      if (id) {
        localStorage.setItem(`repo_${id}_css`, value);
      }
    }, 500),
    [handleCssChange, id],
  );

  useEffect(() => {
    if (editorRef.current && monacoRef.current) {
      const monaco = monacoRef.current;
      const editor = editorRef.current;

      // Check if the model for this language already exists
      const uri = monaco.Uri.file(
        editorOptions.language === "javascript" ? "index.jsx" : "index.tsx",
      );
      let model = monaco.editor.getModel(uri);

      if (!model) {
        // If the model doesn't exist, create a new one
        model = monaco.editor.createModel(
          editor.getValue(),
          editorOptions.language,
          uri,
        );
      } else {
        // If the model exists, just update its language
        monaco.editor.setModelLanguage(model, editorOptions.language);
      }

      editor.setModel(model);
    }
  }, [editorOptions.language]);

  const handleEditorBeforeMount = async (monaco: Monaco) => {
    const highlighter = await getHighlighter({
      themes: ["vitesse-dark", "vitesse-light"],
      langs: ["typescript", "javascript"],
    });
    console.log(highlighter);

    // Set up language services for both JavaScript and TypeScript
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

    // Load from localStorage if available
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

    // Load from localStorage if available
    if (id) {
      const savedCss = localStorage.getItem(`repo_${id}_css`);
      if (savedCss) {
        editor.setValue(savedCss);
      }
    }
  };

  // Mock submit function
  const handleSubmit = useCallback(
    debounce(() => {
      if (id) {
        const code = localStorage.getItem(`repo_${id}`);
        const css = localStorage.getItem(`repo_${id}_css`);
        console.log("Submitting code:", code);
        console.log("Submitting CSS:", css);
        // Here you would typically send this data to your backend
      }
    }, 1000),
    [id],
  );

  useEffect(() => {
    // Set up interval to call handleSubmit every 5 minutes
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
                <div className="flex min-h-screen h-full items-center justify-center">
                  <TabsContent value="main" className="w-full h-full">
                    <Editor
                      height="100vh"
                      language={editorOptions.language}
                      value={editorValue}
                      beforeMount={handleEditorBeforeMount}
                      onChange={(value) =>
                        debouncedHandleEditorChange(value ?? "")
                      }
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
                      onChange={(value) =>
                        debouncedHandleCssChange(value ?? "")
                      }
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
