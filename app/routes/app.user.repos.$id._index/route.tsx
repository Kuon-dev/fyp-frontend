import { useRef, useState, useEffect, useCallback } from "react";
import { getHighlighter } from "shiki";
import { injectCSS, injectTailwind } from "@/integrations/monaco/inject-css";
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
import { setupLanguageService } from "@/integrations/monaco/native.utils";

export default function ReadOnlyEditorLayout() {
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
          </div>
        </LayoutHeader>
        <LayoutBody>
          <ReadOnlyCodeRepoEditorPreview />
        </LayoutBody>
      </Tabs>
    </Layout>
  );
}

function ReadOnlyCodeRepoEditorPreview() {
  const { id } = useParams();
  const { editorValue, cssValue, editorOptions } = useMonacoStore();
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

    // Set editor as read-only
    editor.updateOptions({ readOnly: true });

    if (id) {
      const savedCss = localStorage.getItem(`repo_${id}_css`);
      if (savedCss) {
        editor.setValue(savedCss);
      }
    }
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
                <ScrollArea className="flex min-h-screen h-full items-center justify-center">
                  <TabsContent value="main" className="w-full h-full">
                    <Editor
                      height="100vh"
                      language={editorOptions.language}
                      value={editorValue}
                      beforeMount={handleEditorBeforeMount}
                      theme={editorOptions.theme}
                      options={{
                        fontSize: editorOptions.fontSize,
                        wordWrap: editorOptions.wordWrap,
                        minimap: editorOptions.minimap,
                        lineNumbers: editorOptions.lineNumbers,
                        readOnly: true,
                        domReadOnly: true,
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
                      theme={editorOptions.theme}
                      options={{
                        fontSize: editorOptions.fontSize,
                        wordWrap: editorOptions.wordWrap,
                        minimap: editorOptions.minimap,
                        lineNumbers: editorOptions.lineNumbers,
                        readOnly: true,
                        domReadOnly: true,
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
