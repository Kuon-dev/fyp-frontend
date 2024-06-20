import { injectCSS } from "@/integrations/monaco/inject-css";
import { getRepoById } from "@/lib/fetcher/repo";
import { LoaderFunction, redirect, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
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
  useEffect(() => {
    console.log("test");
  }, [repo]);
  return (
    <LiveProvider
      code={repo.sourceJs}
      noInline
      scope={{ injectCSS, sourceCss: repo.sourceCss }}
    >
      <LivePreview />
      <LiveError />
    </LiveProvider>
  );
}
