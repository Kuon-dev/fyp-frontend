import { useRef, useState, useEffect, useCallback } from "react";
import { injectCSS, injectTailwind } from "@/integrations/monaco/inject-css";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMonacoStore } from "@/stores/monaco-store";
import type { OnChange, OnMount } from "@monaco-editor/react";
import { LiveProvider, LiveError } from "react-live";
import Editor, { loader as monacoLoader } from "@monaco-editor/react";
import type {
  IStandaloneCodeEditor,
  Monaco,
} from "@/integrations/monaco/native.types";
import { Layout, LayoutBody, LayoutHeader } from "@/components/custom/layout";
import { ClientOnly } from "remix-utils/client-only";
import { Link, json, useLoaderData, useParams } from "@remix-run/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LoaderFunction } from "@remix-run/node";
import IframeRenderer from "@/components/repo/editor-preview";
import { EditorMenubar } from "@/components/repo/editor-menubar";
import { MonacoLoading } from "@/components/repo/loading";
import { useDebounce } from "@/hooks/use-debounce";
import type { Repo } from "@/components/repo/card-repo-seller";
import { setupLanguageService } from "@/integrations/monaco/native.utils";
import CodeAnalysis, {
  PrivateCodeCheckResult,
} from "@/components/repo/code-analysis";

monacoLoader.config({
  paths: {
    vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs",
  },
});

export const loader: LoaderFunction = async ({ request, params }) => {
  const { id } = params;
  if (!id) {
    throw new Response("Not Found", { status: 404 });
  }
  const cookieHeader = request.headers.get("Cookie");

  const response = await fetch(`${process.env.BACKEND_URL}/api/v1/repo/${id}`, {
    credentials: "include",
    headers: {
      Cookie: cookieHeader?.toString() || "",
    },
  });

  if (!response.ok) {
    console.log(await response.json());
    throw new Response("Not Found", { status: 404 });
  }

  const data = await response.json();

  const analysisResponse = await fetch(
    `${process.env.BACKEND_URL}/api/v1/code-analysis/${id}`,
    {
      credentials: "include",
      headers: {
        Cookie: cookieHeader?.toString() || "",
      },
    },
  );

  let codeAnalysis = null;
  if (analysisResponse.ok) {
    codeAnalysis = await analysisResponse.json();
  }

  return json({
    repo: data.repo,
    codeAnalysis: codeAnalysis,
  });
};

export function ErrorBoundary() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404 - Repo Not Found</h1>
        <p className="mb-4">The repository you're looking for doesn't exist.</p>
        <Link to="/app/user/purchases">
          <Button>Go Back to Repos</Button>
        </Link>
      </div>
    </div>
  );
}

export default function EditorLayout() {
  const { repo, codeAnalysis } = useLoaderData<{
    repo: Repo;
    codeAnalysis: PrivateCodeCheckResult | null;
  }>();
  const { id: repoId } = useParams<{ id: string }>();
  const [showCodeAnalysis, setShowCodeAnalysis] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("main");
  const { setEditorValue, setCssValue, setEditorOptions } = useMonacoStore();

  useEffect(() => {
    const initializeEditor = () => {
      setEditorValue(repo.sourceJs);
      setCssValue(repo.sourceCss);
      setEditorOptions({
        language: repo.language === "JSX" ? "javascript" : "typescript",
      });
    };

    initializeEditor();
  }, [repoId, repo, setEditorValue, setCssValue, setEditorOptions]);

  //const handleCodeCheck = async (): Promise<void> => {
  //  setIsCheckingCode(true);
  //  setCodeCheckProgress(0);
  //  abortControllerRef.current = new AbortController();
  //
  //  try {
  //    const response = await fetch(
  //      `${window.ENV.BACKEND_URL}/api/v1/repo/${repo.id}/check`,
  //      {
  //        method: "POST",
  //        credentials: "include",
  //        headers: {
  //          "Content-Type": "application/json",
  //        },
  //        signal: abortControllerRef.current.signal,
  //      }
  //    );
  //
  //    if (!response.ok) {
  //      throw new Error("Failed to submit code check");
  //    }
  //
  //    const reader = response.body!.getReader();
  //    await readStream(reader, (progress) => {
  //      setCodeCheckProgress(progress);
  //    });
  //
  //    toast.success("Code check completed successfully");
  //    window.location.reload();
  //  } catch (error) {
  //    if ((error as any).name === "AbortError") {
  //      toast.info("Code check cancelled");
  //    } else {
  //      console.error("Error submitting code check:", error);
  //      toast.error("Failed to submit code check. Please try again.");
  //    }
  //  } finally {
  //    setIsCheckingCode(false);
  //    setShowCodeCheckDialog(false);
  //    setCodeCheckProgress(0);
  //    abortControllerRef.current = null;
  //  }
  //};
  //
  //const handleCancelCodeCheck = () => {
  //  if (abortControllerRef.current) {
  //    abortControllerRef.current.abort();
  //  }
  //  setShowCodeCheckDialog(false);
  //};

  return (
    <Layout>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="">
        <LayoutHeader className="flex flex-col gap-4 justify-start items-start">
          <Link to="/app/user/purchases">
            <Button>Back</Button>
          </Link>

          <div className="flex flex-row gap-4">
            <TabsList className="grid w-[400px] grid-cols-2">
              <TabsTrigger value="main">react</TabsTrigger>
              <TabsTrigger value="css">css</TabsTrigger>
            </TabsList>
            <EditorMenubar />

            <Button
              onClick={() => setShowCodeAnalysis(true)}
              disabled={!codeAnalysis}
            >
              View Code Analysis
            </Button>
          </div>
        </LayoutHeader>
        <LayoutBody>
          <CodeRepoEditorPreview
            repoId={repoId}
            initialCode={repo.sourceJs}
            initialCss={repo.sourceCss}
            activeTab={activeTab as "main" | "css"}
          />
        </LayoutBody>
      </Tabs>
      {codeAnalysis && (
        <CodeAnalysis
          isOpen={showCodeAnalysis}
          onClose={() => setShowCodeAnalysis(false)}
          codeCheckResult={codeAnalysis}
          repoName={repo.name}
          repoLanguage={repo.language}
          isPublicView={true}
        />
      )}
    </Layout>
  );
}

function CodeRepoEditorPreview({
  repoId,
  initialCode,
  initialCss,
  activeTab,
}: {
  repoId: string | undefined;
  initialCode: string;
  initialCss: string;
  activeTab: string;
}) {
  const {
    editorValue,
    cssValue,
    editorOptions,
    handleEditorChange: storeHandleEditorChange,
    setEditorValue,
    setCssValue,
  } = useMonacoStore();

  const [renderValue, setRenderValue] = useState("");
  const jsEditorRef = useRef<IStandaloneCodeEditor | null>(null);
  const cssEditorRef = useRef<IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const debouncedJsValue = useDebounce(editorValue, 500);
  const debouncedCssValue = useDebounce(cssValue, 500);

  // Refs to hold the latest values
  const latestEditorValueRef = useRef(editorValue);
  const latestCssValueRef = useRef(cssValue);

  // Update refs when values change
  useEffect(() => {
    latestEditorValueRef.current = editorValue;
    latestCssValueRef.current = cssValue;
  }, [editorValue, cssValue]);

  // Set initial values and update when they change
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

  const handleEditorBeforeMount = useCallback(async (monaco: Monaco) => {
    await setupLanguageService(monaco);
  }, []);

  const updateEditorContent = useCallback(() => {
    if (jsEditorRef.current && monacoRef.current) {
      const model = jsEditorRef.current.getModel();
      if (model && model.getValue() !== latestEditorValueRef.current) {
        model.setValue(latestEditorValueRef.current);
      }
    }
    if (cssEditorRef.current && monacoRef.current) {
      const model = cssEditorRef.current.getModel();
      if (model && model.getValue() !== latestCssValueRef.current) {
        model.setValue(latestCssValueRef.current);
      }
    }
  }, []);

  const handleJsEditorDidMount: OnMount = useCallback(
    (editor, monaco) => {
      jsEditorRef.current = editor;
      monacoRef.current = monaco;

      const uri = monaco.Uri.file(
        editorOptions.language === "javascript" ? "index.jsx" : "index.tsx",
      );
      let model = monaco.editor.getModel(uri);
      if (!model) {
        model = monaco.editor.createModel(
          latestEditorValueRef.current,
          editorOptions.language,
          uri,
        );
      }
      editor.setModel(model);
      updateEditorContent();
    },
    [editorOptions.language, updateEditorContent],
  );

  const handleCssEditorDidMount: OnMount = useCallback(
    (editor, monaco) => {
      cssEditorRef.current = editor;
      if (!monacoRef.current) monacoRef.current = monaco;

      const uri = monaco.Uri.file("index.css");
      let model = monaco.editor.getModel(uri);
      if (!model) {
        model = monaco.editor.createModel(
          latestCssValueRef.current,
          "css",
          uri,
        );
      }
      editor.setModel(model);
      updateEditorContent();
    },
    [updateEditorContent],
  );

  // Update editor content whenever activeTab changes
  useEffect(() => {
    updateEditorContent();
  }, [activeTab, updateEditorContent]);

  const handleEditorContentChange: OnChange = useCallback(
    (value) => {
      const language = activeTab === "main" ? editorOptions.language : "css";
      storeHandleEditorChange(value ?? "", language);
    },
    [activeTab, editorOptions.language, storeHandleEditorChange],
  );

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
                  <div
                    className="w-full h-full"
                    style={{ display: activeTab === "main" ? "block" : "none" }}
                  >
                    <Editor
                      height="100vh"
                      language={editorOptions.language}
                      value={editorValue}
                      beforeMount={handleEditorBeforeMount}
                      onChange={handleEditorContentChange}
                      theme={editorOptions.theme}
                      options={{
                        fontSize: editorOptions.fontSize,
                        wordWrap: editorOptions.wordWrap,
                        minimap: editorOptions.minimap,
                        lineNumbers: editorOptions.lineNumbers,
                      }}
                      onMount={handleJsEditorDidMount}
                      key={`js-editor-${repoId}`} // Add key to force remount
                    />
                  </div>
                  <div
                    className="w-full h-full"
                    style={{ display: activeTab === "css" ? "block" : "none" }}
                  >
                    <Editor
                      height="100vh"
                      language="css"
                      value={cssValue}
                      beforeMount={handleEditorBeforeMount}
                      onChange={handleEditorContentChange}
                      theme={editorOptions.theme}
                      options={{
                        fontSize: editorOptions.fontSize,
                        wordWrap: editorOptions.wordWrap,
                        minimap: editorOptions.minimap,
                        lineNumbers: editorOptions.lineNumbers,
                      }}
                      onMount={handleCssEditorDidMount}
                      key={`css-editor-${repoId}`} // Add key to force remount
                    />
                  </div>
                </ScrollArea>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={50}>
                <div className="bg-slate-950 min-h-screen relative">
                  <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]">
                    <IframeRenderer
                      sourceJs={debouncedJsValue}
                      sourceCss={debouncedCssValue}
                      language={
                        editorOptions.language === "javascript" ? "JSX" : "TSX"
                      }
                      name="preview"
                      className="h-full z-50"
                    />
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
