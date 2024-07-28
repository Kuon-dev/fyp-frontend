import { useState, useEffect } from "react";
import { injectCSS } from "@/integrations/monaco/inject-css";
import { LoaderFunction, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { LiveProvider, LivePreview } from "react-live";

export const loader: LoaderFunction = async ({ params }) => {
  const id = params.id;
  const response = await fetch(
    `${process.env.BACKEND_URL}/api/v1/repo/${id}/server`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  const data = await response.json();
  return json({
    repo: data.repo,
  });
};

export default function ViewRepo() {
  const { repo } = useLoaderData<{ repo: BackendCodeRepo }>();
  const [renderValue, setRenderValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const ZOOM_FACTOR = 0.5; // Fixed zoom factor, adjust as needed

  useEffect(() => {
    if (!repo) {
      setIsLoading(false);
      return;
    }
    const prepareCode = () => {
      const importRegex = /^import\s.+?;?\s*$/gm;
      const cleanedJs = (repo.sourceJs || "").replace(importRegex, "").trim();
      setRenderValue(cleanedJs);
      setIsLoading(false);
    };
    prepareCode();
  }, [repo]);

  useEffect(() => {
    if (repo && repo.sourceCss) {
      injectCSS(repo.sourceCss);
    }
  }, [repo]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (!repo) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 px-4 dark:bg-gray-900">
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-50">
            500
          </h1>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
            Oops, something went wrong on our end.
          </p>
        </div>
      </div>
    );
  }

  const previewContainerStyle: React.CSSProperties = {
    width: "100%",
    height: "100vh", // Use full viewport height
    overflow: "hidden",
    border: "1px solid #ccc",
    borderRadius: "4px",
  };

  const previewWrapperStyle: React.CSSProperties = {
    transform: `scale(${ZOOM_FACTOR})`,
    transformOrigin: "top left",
    width: `${100 / ZOOM_FACTOR}%`,
    height: `${100 / ZOOM_FACTOR}%`,
  };

  return (
    <div className="w-full h-screen">
      <LiveProvider code={renderValue} noInline>
        <div style={previewContainerStyle}>
          <div style={previewWrapperStyle}>
            <LivePreview />
          </div>
        </div>
      </LiveProvider>
    </div>
  );
}
