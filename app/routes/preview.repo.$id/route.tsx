import React, { useState, useEffect } from "react";
import { injectCSS } from "@/integrations/monaco/inject-css";
import { LoaderFunction, redirect, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { LiveProvider, LiveEditor, LiveError, LivePreview } from "react-live";

export const loader: LoaderFunction = async ({ params }) => {
  const id = params.id;
  const response = await fetch(
    `${process.env.BACKEND_URL}/api/v1/repo/${id}/public`,
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

  useEffect(() => {
    if (!repo) {
      setIsLoading(false);
      return;
    }

    const prepareCode = () => {
      const importRegex = /^import\s.+?;?\s*$/gm;
      const cleanedJs = (repo.sourceJs || "").replace(importRegex, "").trim();

      setRenderValue(`
        injectCSS(\`${repo.sourceCss || ""}\`);
        ${cleanedJs}
      `);
      setIsLoading(false);
    };

    prepareCode();
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

  return (
    <div className="">
      <LiveProvider code={renderValue} noInline scope={{ injectCSS }}>
        <LivePreview />
      </LiveProvider>
    </div>
  );
}
