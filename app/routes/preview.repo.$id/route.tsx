import React from "react";
import { injectCSS } from "@/integrations/monaco/inject-css";
import { getRepoById } from "@/lib/fetcher/repo";
import { LoaderFunction, redirect, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { LiveProvider, LiveEditor, LiveError, LivePreview } from "react-live";

export const loader: LoaderFunction = async ({ params }) => {
  const id = params.id;
  const data = await getRepoById(id ?? "");
  return json({
    repo: data,
  });
};

export default function ViewRepo() {
  const { repo } = useLoaderData<typeof loader>() as { repo: BackendCodeRepo };
  const [cssValue, setCssValue] = React.useState(repo.sourceCss);
  const [renderValue, setRenderValue] = React.useState(repo.sourceJs);

  React.useEffect(() => {
    if (!repo) return;
    setCssValue(repo.sourceCss);
    // Remove react import statements
    const importRegex = /^import\s.+?;?\s*$/gm;
    const value = repo.sourceJs.replace(importRegex, "").trim();
    // Add import css back
    setRenderValue(`
      injectCSS(cssValue);
      ${value}
    `);
  }, [repo.sourceJs, cssValue, repo]);

  return (
    <LiveProvider code={renderValue} noInline scope={{ injectCSS, cssValue }}>
      <LivePreview />
    </LiveProvider>
  );
}
