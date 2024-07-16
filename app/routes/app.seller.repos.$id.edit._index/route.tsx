import { useRef, useState, useEffect, useCallback } from "react";
import { getHighlighter } from "shiki";
import { injectCSS, injectTailwind } from "@/integrations/monaco/inject-css";
import { toast } from "sonner";
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
import Editor, { loader as monacoLoader } from "@monaco-editor/react";
import type {
  IStandaloneCodeEditor,
  Monaco,
} from "@/integrations/monaco/native.types";
import { Layout, LayoutBody, LayoutHeader } from "@/components/custom/layout";
import { Spinner } from "@/components/custom/spinner";
import { ClientOnly } from "remix-utils/client-only";
import { Link, json, useLoaderData, useParams } from "@remix-run/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import debounce from "lodash/debounce";
import { LoaderFunction } from "@remix-run/node";
import type { Repo } from "@/components/repo/card-repo-seller";
import { EditorMenubar } from "@/components/repo/editor-menubar";

monacoLoader.config({
  paths: {
    vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs",
  },
});

// Add Remix loader
export const loader: LoaderFunction = async ({ params }) => {
  const { id } = params;
  if (!id) {
    throw new Response("Not Found", { status: 404 });
  }

  const response = await fetch(`${process.env.BACKEND_URL}/api/v1/repo/${id}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Response("Not Found", { status: 404 });
  }

  const data = await response.json();
  return json({
    repo: data.repo,
  });
};

// Add Error Boundary
export function ErrorBoundary() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404 - Repo Not Found</h1>
        <p className="mb-4">The repository you're looking for doesn't exist.</p>
        <Link to="/app/seller/repos">
          <Button>Go Back to Repos</Button>
        </Link>
      </div>
    </div>
  );
}

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
  try {
    const response = await fetch(
      "https://unpkg.com/@types/react@18.0.27/index.d.ts",
    );
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
  } catch (error) {
    console.error("Failed to fetch React types:", error);
  }
};

export default function EditorLayout() {
  const { repo } = useLoaderData<{ repo: Repo }>();
  const [isSaving, setIsSaving] = useState(false);
  const { editorOptions, editorValue, cssValue } = useMonacoStore();
  const [activeTab, setActiveTab] = useState("main");

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(
        `${window.ENV.BACKEND_URL}/api/v1/repo/${repo.id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sourceJs: editorValue,
            sourceCss: cssValue,
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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="">
        <LayoutHeader className="flex flex-col gap-4 justify-start items-start">
          <Link to="/app/seller/repos">
            <Button>Back</Button>
          </Link>

          <div className="flex flex-row gap-4">
            <TabsList className="grid w-[400px] grid-cols-2">
              <TabsTrigger value="main">index</TabsTrigger>
              <TabsTrigger value="css">css</TabsTrigger>
            </TabsList>
            <EditorMenubar />

            <Button onClick={handleSave} disabled={isSaving}>
              Save
            </Button>
          </div>
        </LayoutHeader>
        <LayoutBody>
          <CodeRepoEditorPreview
            initialCode={repo.sourceJs}
            initialCss={repo.sourceCss}
            activeTab={activeTab}
          />
        </LayoutBody>
      </Tabs>
    </Layout>
  );
}

function CodeRepoEditorPreview({
  initialCode,
  initialCss,
  activeTab,
}: {
  initialCode: string;
  initialCss: string;
  activeTab: string;
}) {
  const {
    editorValue,
    cssValue,
    editorOptions,
    handleEditorChange,
    setEditorValue,
    setCssValue,
  } = useMonacoStore();
  const [renderValue, setRenderValue] = useState("");
  const editorRef = useRef<IStandaloneCodeEditor | null>(null);
  const cssEditorRef = useRef<IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);

  // Set initial values
  useEffect(() => {
    setEditorValue(initialCode);
    setCssValue(initialCss);
  }, [initialCode, initialCss, setEditorValue, setCssValue]);

  // Update renderValue when editorValue or cssValue changes
  useEffect(() => {
    const importRegex = /^import\s.+?;?\s*$/gm;
    const value = editorValue.replace(importRegex, "").trim();
    setRenderValue(`
      injectCSS(${JSON.stringify(cssValue)});
      ${value}
    `);
  }, [editorValue, cssValue]);

  const debouncedHandleEditorChange = useCallback(
    debounce(
      (
        value: string,
        language: "javascript" | "typescript" | "css",
        editor: IStandaloneCodeEditor,
      ) => {
        const position = editor.getPosition();
        handleEditorChange(value, language);
        if (position) {
          editor.setPosition(position);
          editor.revealPositionInCenter(position);
        }
      },
      500,
    ),
    [handleEditorChange],
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

  // Update editor content when active tab changes
  useEffect(() => {
    if (activeTab === "main" && editorRef.current) {
      const editor = editorRef.current;
      const position = editor.getPosition();
      const model = editor.getModel();
      if (model) {
        model.setValue(editorValue);
        if (position) {
          editor.setPosition(position);
          editor.revealPositionInCenter(position);
        }
      }
    } else if (activeTab === "css" && cssEditorRef.current) {
      const editor = cssEditorRef.current;
      const position = editor.getPosition();
      const model = editor.getModel();
      if (model) {
        model.setValue(cssValue);
        if (position) {
          editor.setPosition(position);
          editor.revealPositionInCenter(position);
        }
      }
    }
  }, [activeTab, editorValue, cssValue]);

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
        editorValue,
        editorOptions.language,
        uri,
      );
    }
    editor.setModel(model);
  };

  const handleEditorCssDidMount: OnMount = (editor, monaco) => {
    cssEditorRef.current = editor;
    const uri = monaco.Uri.file("index.css");
    let model = monaco.editor.getModel(uri);
    if (!model) {
      model = monaco.editor.createModel(cssValue, "css", uri);
    }
    editor.setModel(model);
  };

  const handleJsEditorChange: OnChange = (value, event) => {
    if (editorRef.current) {
      debouncedHandleEditorChange(
        value ?? "",
        editorOptions.language,
        editorRef.current,
      );
    }
  };

  const handleCssEditorChange: OnChange = (value, event) => {
    if (cssEditorRef.current) {
      debouncedHandleEditorChange(value ?? "", "css", cssEditorRef.current);
    }
  };

  return (
    <div className="w-full h-full">
      <LiveProvider
        code={renderValue}
        noInline
        scope={{ injectCSS, cssValue, injectTailwind }}
      >
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
                      onChange={handleJsEditorChange}
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
                      onChange={handleCssEditorChange}
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
