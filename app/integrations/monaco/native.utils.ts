//import type { Monaco, MonacoContext, NodeModuleDep } from "./native.types";
import type * as Monaco from "monaco-editor";

/* eslint-disable @typescript-eslint/no-explicit-any */
const getCdnUrl = (pkgName: string, pkgVersion: string, pkgPath: string) => {
  return `https://cdn.jsdelivr.net/npm/${pkgName}@${pkgVersion}${pkgPath}`;
};

//const monacoCtx: MonacoContext = {
//  deps: [],
//  loader: null,
//  tsWorker: null,
//};
//
//const MONACO_VERSION = "0.48.0";
//const MONACO_VS_URL = getCdnUrl("monaco-editor", MONACO_VERSION, "/min/vs");
//const MONACO_LOADER_URL = `${MONACO_VS_URL}/loader.js`;
//
//export const fetchDep = async (cache: Cache, dep: NodeModuleDep) => {
//  const url = getCdnUrl(dep.pkgName, dep.pkgVersion, dep.pkgPath);
//  const req = new Request(url);
//  const cachedRes = await cache.match(req);
//  if (cachedRes) {
//    return cachedRes.clone().text();
//  }
//  const fetchRes = await fetch(req);
//  if (fetchRes.ok) {
//    if (!req.url.includes("localhost")) {
//      await cache.put(req, fetchRes.clone());
//    }
//    return fetchRes.clone().text();
//  }
//  throw new Error(`Unable to fetch: ${url}`);
//};
//
//export const getMonaco = async (): Promise<Monaco> => {
//  if (!monacoCtx.loader) {
//    // Lazy-load the Monaco AMD script
//    monacoCtx.loader = new Promise<Monaco>((resolve, reject) => {
//      const script = document.createElement("script");
//      script.addEventListener("error", reject);
//      script.addEventListener("load", () => {
//        (window as any).require.config({ paths: { vs: MONACO_VS_URL } });
//
//        // Load the editor main module
//        (window as any).require(["vs/editor/editor.main"], () => {
//          resolve((window as any).monaco);
//        });
//      });
//      script.async = true;
//      script.src = MONACO_LOADER_URL;
//      document.head.appendChild(script);
//    });
//  }
//  return monacoCtx.loader;
//};
//
//export const getUri = (monaco: Monaco, filePath: string) => {
//  return new monaco.Uri().with({ path: filePath });
//};
//
//export const configureMonaco = async () => {
//  const monaco = await getMonaco();
//  // Customize Monaco editor as needed
//  // const theme = await import("monaco-themes/themes/GitHub Dark.json");
//  // monaco.editor.defineTheme("dracula", theme as any);
//  // monaco.editor.setTheme("dracula");
//  return monaco;
//};
//
//export function createResource(asyncFunction: () => Promise<any>) {
//  let status = "pending";
//  let result: any;
//  const suspender = asyncFunction().then(
//    (response) => {
//      status = "success";
//      result = response;
//    },
//    (error) => {
//      status = "error";
//      result = error;
//    },
//  );
//
//  return {
//    read() {
//      if (status === "pending") {
//        throw suspender;
//      } else if (status === "error") {
//        throw result;
//      }
//      return result;
//    },
//  };
//}
//
//export const monacoEditorResource = createResource(configureMonaco);

export const setupLanguageService = async (monaco: typeof Monaco) => {
  const compilerOptions: Monaco.languages.typescript.CompilerOptions = {
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
    lib: ["dom", "dom.iterable", "esnext"],
    module: monaco.languages.typescript.ModuleKind.ESNext,
  };

  const setLanguageDefaults = (
    defaults: Monaco.languages.typescript.LanguageServiceDefaults,
  ) => {
    defaults.setCompilerOptions(compilerOptions);
    defaults.setEagerModelSync(true);
    defaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
      noSuggestionDiagnostics: false,
    });
  };

  setLanguageDefaults(monaco.languages.typescript.javascriptDefaults);
  setLanguageDefaults(monaco.languages.typescript.typescriptDefaults);

  const fetchAndAddTypes = async (url: string, filePath: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const types = await response.text();
      monaco.languages.typescript.javascriptDefaults.addExtraLib(
        types,
        filePath,
      );
      monaco.languages.typescript.typescriptDefaults.addExtraLib(
        types,
        filePath,
      );
    } catch (error) {
      console.error(`Failed to fetch types from ${url}:`, error);
    }
  };

  const typesToFetch = [
    {
      url: "https://unpkg.com/@types/react@18.0.27/index.d.ts",
      path: "file:///node_modules/@types/react/index.d.ts",
    },
    {
      url: "https://unpkg.com/@types/react-dom@18.0.10/index.d.ts",
      path: "file:///node_modules/@types/react-dom/index.d.ts",
    },
  ];

  await Promise.all(
    typesToFetch.map(({ url, path }) => fetchAndAddTypes(url, path)),
  );

  const reactLiveTypes = `
    declare module 'react-dom' {
      export const render: (props: any) => any;
      export default render: (props: any) => any;
    }
  `;

  const reactJSXRuntime = `
    declare module 'react/jsx-runtime' {
      export default any;
    }
  `;

  monaco.languages.typescript.javascriptDefaults.addExtraLib(
    reactLiveTypes,
    "file:///node_modules/@types/react-dom/custom.d.ts",
  );
  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    reactLiveTypes,
    "file:///node_modules/@types/react-dom/custom.d.ts",
  );

  monaco.languages.typescript.javascriptDefaults.addExtraLib(
    reactJSXRuntime,
    "file:///node_modules/@types/react/jsx-runtime/custom.d.ts",
  );
  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    reactJSXRuntime,
    "file:///node_modules/@types/react/jsx-runtime/custom.d.ts",
  );

  // Add custom type definitions for findSectionHeaders if needed
  const customTypes = `
    interface MonacoEditor extends Monaco.editor.ICodeEditor {
      findSectionHeaders?: () => any;
    }
  `;
  monaco.languages.typescript.javascriptDefaults.addExtraLib(
    customTypes,
    "file:///custom-types.d.ts",
  );
  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    customTypes,
    "file:///custom-types.d.ts",
  );
};
