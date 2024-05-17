import type { Monaco, MonacoContext, NodeModuleDep } from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any */
const getCdnUrl = (pkgName: string, pkgVersion: string, pkgPath: string) => {
  return `https://cdn.jsdelivr.net/npm/${pkgName}@${pkgVersion}${pkgPath}`;
};

const monacoCtx: MonacoContext = {
  deps: [],
  loader: null,
  tsWorker: null,
};

const MONACO_VERSION = "0.48.0";
const MONACO_VS_URL = getCdnUrl("monaco-editor", MONACO_VERSION, "/min/vs");
const MONACO_LOADER_URL = `${MONACO_VS_URL}/loader.js`;

export const fetchDep = async (cache: Cache, dep: NodeModuleDep) => {
  const url = getCdnUrl(dep.pkgName, dep.pkgVersion, dep.pkgPath);
  const req = new Request(url);
  const cachedRes = await cache.match(req);
  if (cachedRes) {
    return cachedRes.clone().text();
  }
  const fetchRes = await fetch(req);
  if (fetchRes.ok) {
    if (!req.url.includes("localhost")) {
      await cache.put(req, fetchRes.clone());
    }
    return fetchRes.clone().text();
  }
  throw new Error(`Unable to fetch: ${url}`);
};

export const getMonaco = async (): Promise<Monaco> => {
  if (!monacoCtx.loader) {
    // Lazy-load the Monaco AMD script
    monacoCtx.loader = new Promise<Monaco>((resolve, reject) => {
      const script = document.createElement("script");
      script.addEventListener("error", reject);
      script.addEventListener("load", () => {
        (window as any).require.config({ paths: { vs: MONACO_VS_URL } });

        // Load the editor main module
        (window as any).require(["vs/editor/editor.main"], () => {
          resolve((window as any).monaco);
        });
      });
      script.async = true;
      script.src = MONACO_LOADER_URL;
      document.head.appendChild(script);
    });
  }
  return monacoCtx.loader;
};

export const getUri = (monaco: Monaco, filePath: string) => {
  return new monaco.Uri().with({ path: filePath });
};

export const configureMonaco = async () => {
  const monaco = await getMonaco();
  // Customize Monaco editor as needed
  // const theme = await import("monaco-themes/themes/GitHub Dark.json");
  // monaco.editor.defineTheme("dracula", theme as any);
  // monaco.editor.setTheme("dracula");
  return monaco;
};

export function createResource(asyncFunction: () => Promise<any>) {
  let status = "pending";
  let result: any;
  const suspender = asyncFunction().then(
    (response) => {
      status = "success";
      result = response;
    },
    (error) => {
      status = "error";
      result = error;
    },
  );

  return {
    read() {
      if (status === "pending") {
        throw suspender;
      } else if (status === "error") {
        throw result;
      }
      return result;
    },
  };
}

export const monacoEditorResource = createResource(configureMonaco);
