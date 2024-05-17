import React, { useRef, useState, useEffect } from "react";
import { configureMonaco } from "./utils";
import type { IStandaloneCodeEditor } from "./types";

interface MonacoEditorProps {
  value: string | undefined;
  onValueChange: (val: string) => void;
}

const MonacoEditor: React.FC<MonacoEditorProps> = (props) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [hasInitialized, setHasInitialized] = useState<boolean>(false);
  const [monacoInstance, setMonacoInstance] =
    useState<IStandaloneCodeEditor | null>(null);

  // timer for debug
  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     console.log(monacoInstance)
  //   }, 1000);
  //   return () => clearInterval(timer);
  // });

  useEffect(() => {
    if (monacoInstance) {
      const monacoEditor = monacoInstance;

      monacoEditor.onKeyUp(() => {
        const newValue = monacoEditor.getModel()?.getValue();
        if (newValue !== props.value) {
          props.onValueChange(newValue ?? "");
        }
      });
      // return () => monacoEditor.dispose();
    }
  }, [monacoInstance, props]);

  useEffect(() => {
    if (hasInitialized) {
      const monacoEditor = monacoInstance;
      if (monacoEditor && props.value !== monacoEditor.getModel()?.getValue()) {
        monacoEditor.getModel()?.setValue(props.value ?? "");
      }
    } else {
      const initMonaco = async () => {
        const monaco = await configureMonaco();
        const ts = monaco.languages.typescript;

        ts.typescriptDefaults.setCompilerOptions({
          allowJs: true,
          allowNonTsExtensions: true,
          esModuleInterop: true,
          isolatedModules: true,
          jsx: ts.JsxEmit.ReactJSX,
          moduleResolution: ts.ModuleResolutionKind.NodeJs,
          noEmit: true,
          skipLibCheck: true,
          target: ts.ScriptTarget.Latest,
          typeRoots: ["node_modules/@types"],
          jsxFactory: "react",
        });

        ts.javascriptDefaults.setDiagnosticsOptions({
          noSemanticValidation: true,
          noSyntaxValidation: false,
        });

        if (editorRef.current) {
          editorRef.current.innerHTML = "";
          const monacoEditor = monaco.editor.create(editorRef.current, {
            automaticLayout: true,
            lineDecorationsWidth: 5,
            lineNumbersMinChars: 3,
            minimap: { enabled: false },
            roundedSelection: false,
            scrollBeyondLastLine: false,
            tabSize: 2,
            value: "",
            language: "typescript",
            theme: "vs-dark",
          });

          ts.typescriptDefaults.setEagerModelSync(true);
          setMonacoInstance(monacoEditor);
          setHasInitialized(true);
        }
      };

      initMonaco();
    }
  }, [props.value, hasInitialized, monacoInstance]);

  return (
    <div className="relative w-full">
      <div ref={editorRef} className="h-[40rem]" id="code-space">
        loading
      </div>
      <div id="my-statusbar"></div>
    </div>
  );
};

export default MonacoEditor;
