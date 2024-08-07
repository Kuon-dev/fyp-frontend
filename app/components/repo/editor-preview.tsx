import React, { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import lodash from "lodash";
import { transform } from "sucrase";

interface IframeRendererProps {
  sourceJs: string;
  sourceCss: string;
  language: "JSX" | "TSX";
  name: string;
  className?: string;
  fullscreen?: boolean;
  zoomOutFactor?: number; // New prop for controlling zoom level
}

const IframeRenderer: React.FC<IframeRendererProps> = ({
  sourceJs,
  sourceCss,
  language,
  name,
  className,
  fullscreen = false,
  zoomOutFactor = 1, // Default zoom out to 75%
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [debug, setDebug] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [key, setKey] = useState(0);

  const logDebug = useCallback((message: string) => {
    console.log(message);
    setDebug((prev) => prev + "\n" + message);
  }, []);

  const transformCode = useCallback(
    (code: string, lang: "JSX" | "TSX") => {
      try {
        const result = transform(code, {
          transforms: ["jsx", "typescript"],
          production: true,
        });
        setError(null);
        return result.code;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        logDebug("Error transforming code: " + errorMessage);
        setError(errorMessage);
        return null;
      }
    },
    [logDebug],
  );

  const updateIframeContent = useCallback(
    (iframeWindow: Window, transformedCode: string, extractedName: string) => {
      const injectedCode = `
      ${transformedCode}
      window.CustomComponent = ${extractedName};
    `;
      iframeWindow.postMessage(
        { type: "UPDATE_CODE", code: injectedCode },
        "*",
      );
    },
    [],
  );

  const debouncedUpdateIframe = useCallback(
    lodash.debounce(
      (
        iframeWindow: Window,
        transformedCode: string,
        extractedName: string,
      ) => {
        updateIframeContent(iframeWindow, transformedCode, extractedName);
      },
      300,
    ),
    [updateIframeContent],
  );

  useEffect(() => {
    const cleanedCode = removeImports(sourceJs);
    const [extractedName, hasRender, codeWithoutRender] =
      extractComponentName(cleanedCode);

    const transformedCode = transformCode(codeWithoutRender, language);
    if (!transformedCode) {
      logDebug("Failed to transform source code");
      return;
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "IFRAME_LOG") {
        logDebug("Iframe message: " + event.data.message);
      } else if (event.data && event.data.type === "IFRAME_READY") {
        const iframeWindow = iframeRef.current?.contentWindow;
        if (iframeWindow) {
          updateIframeContent(iframeWindow, transformedCode, extractedName);
        }
      }
    };

    window.addEventListener("message", handleMessage);

    if (iframeRef.current?.contentWindow) {
      debouncedUpdateIframe(
        iframeRef.current.contentWindow,
        transformedCode,
        extractedName,
      );
    }

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [sourceJs, language, logDebug, transformCode, debouncedUpdateIframe]);

  useEffect(() => {
    setKey((prevKey) => prevKey + 1);
  }, [sourceJs, sourceCss]);

  useEffect(() => {
    if (iframeRef.current) {
      const iframeContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>${sourceCss}</style>
            <script src="https://cdn.tailwindcss.com"></script>
            <script src="https://unpkg.com/react@17/umd/react.development.js"></script>
            <script src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
            <script>
              function log(message) {
                console.log(message);
                window.parent.postMessage({ type: 'IFRAME_LOG', message: message }, '*');
              }

              window.addEventListener('message', function(event) {
                if (event.data && event.data.type === 'UPDATE_CODE') {
                  try {
                    eval(event.data.code);
                    if (typeof window.CustomComponent !== 'undefined') {
                      ReactDOM.render(React.createElement(window.CustomComponent), document.getElementById('root'));
                      log('Custom component rendered');
                    } else {
                      log('Custom component not found after evaluation');
                    }
                  } catch (error) {
                    log('Error rendering custom component: ' + error.message);
                  }
                }
              });

              window.parent.postMessage({ type: 'IFRAME_READY' }, '*');
            </script>
          </head>
          <body class="h-full">
            <div id="root"></div>
          </body>
        </html>
      `;
      iframeRef.current.srcdoc = iframeContent;
      logDebug("Iframe content initialized");
    }
  }, [sourceCss, logDebug, key]);

  const containerClass = cn(
    "relative border rounded overflow-hidden",
    fullscreen ? "w-full h-full" : "w-full h-48",
    className,
  );

  const iframeStyle: React.CSSProperties = {
    transform: `scale(${zoomOutFactor})`,
    transformOrigin: "top left",
    width: `${100 / zoomOutFactor}%`,
    height: `${100 / zoomOutFactor}%`,
  };

  return (
    <div className={containerClass}>
      {error ? (
        <div className="w-full h-full flex flex-col items-center justify-center bg-red-100 text-red-800 p-4">
          <div>
            <h3 className="font-bold mb-2">Transformation Error:</h3>
            <pre className="text-sm whitespace-pre-wrap">{error}</pre>
          </div>
        </div>
      ) : (
        <iframe
          key={key}
          ref={iframeRef}
          style={iframeStyle}
          className="w-full h-full"
          title={name}
          sandbox="allow-scripts allow-popups allow-same-origin"
        />
      )}
      <pre className="mt-4 p-2 bg-gray-100 text-xs whitespace-pre-wrap">
        {debug}
      </pre>
    </div>
  );
};

function removeImports(code: string): string {
  return code.replace(/^import\s+.*?;?\s*$/gm, "");
}

const extractComponentName = (code: string): [string, boolean, string] => {
  const renderRegex = /render\(\s*<(\w+)(?:\s+\/|\s*>|\s[^>]*>)/;
  const renderMatch = code.match(renderRegex);

  if (renderMatch) {
    const componentName = renderMatch[1];
    const codeWithoutRender = code.replace(/render\([^)]+\);?/, "");
    return [componentName, true, codeWithoutRender];
  }

  return ["", false, code];
};

export default IframeRenderer;
