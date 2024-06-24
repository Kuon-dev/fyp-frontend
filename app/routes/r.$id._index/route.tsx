import {
  // Link,
  json,
  useLoaderData,
} from "@remix-run/react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { LiveProvider, LivePreview } from "react-live";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  DropdownMenuTrigger,
  // DropdownMenuLabel,
  // DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenu,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TabsList } from "@radix-ui/react-tabs";
import { ClientOnly } from "remix-utils/client-only";
import React, { useEffect, useRef, useState } from "react";
import { EyeIcon } from "lucide-react";
import { getRepoById } from "@/lib/fetcher/repo";
import { LoaderFunction } from "@remix-run/node";
import { codeToHtml } from "shiki";
import { Spinner } from "@/components/custom/spinner";
import type { RepoNoSource } from "@/stores/search-store";
import type { ImperativePanelHandle } from "react-resizable-panels";

export const loader: LoaderFunction = async ({ params }) => {
  const id = params.id;
  const data = (await getRepoById(id ?? "")) ?? null;
  return json({
    repo: data,
  });
};

export default function Component() {
  const { repo } = useLoaderData<typeof loader>() as {
    repo: BackendCodeRepo | null;
  };
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOnPreview, setIsOnPreview] = useState(true);
  const shikiContainer = useRef<HTMLDivElement | null>(null);

  const [panelSize] = useState(0);
  const [panelDraggingCheck, setPanelDraggingCheck] = useState<string | null>(
    null,
  );
  // const panelRefFirst = useRef<ImperativePanelHandle>(null);
  // const panelRefSecond = useRef<ImperativePanelHandle>(null);

  // const handleResize = (size: number, id: string) => {
  // };
  const [code, setCode] = useState(repo?.sourceJs ?? "");
  const [cssValue, setCssValue] = useState(repo?.sourceCss ?? "");

  useEffect(() => {
    const initShiki = async () => {
      try {
        const html = await codeToHtml(code, {
          lang: repo?.language.toLowerCase() ?? "tsx",
          theme: "vitesse-dark",
        });
        if (shikiContainer.current) {
          shikiContainer.current.innerHTML = html;
          setIsLoaded(true);
        }
      } catch (error) {
        console.error("Error generating code HTML:", error);
      }
    };
    initShiki();
  });

  useEffect(() => {
    // Remove react import statements
    const importRegex = /^import\s.+?;?\s*$/gm;
    const value = code.replace(importRegex, "").trim();
    setCode(value);
    // Add import css back
    // setRenderValue(`
    //   injectCSS(cssValue);
    //   ${value}
    // `);
  }, []);

  return (
    <div key="1" className="flex flex-col h-screen">
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto py-8 px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-16 max-w-full w-full">
            <ClientOnly>
              {() => (
                <React.Fragment>
                  <Tabs
                    className="flex flex-col gap-4 max-w-inherit"
                    defaultValue={"preview"}
                    onValueChange={(value) =>
                      setIsOnPreview(value === "preview")
                    }
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h1 className="text-2xl font-bold">
                          {isOnPreview ? "Preview" : "Code"}
                        </h1>
                        <p className="text-gray-500">
                          A beautiful and responsive code repository.
                        </p>
                      </div>
                      <TabsList className="flex items-center space-x-4">
                        <TabsTrigger asChild value="code">
                          <Button size="sm" variant="outline">
                            <CodeIcon className="w-4 h-4 mr-2" />
                            View Code
                          </Button>
                        </TabsTrigger>
                        <TabsTrigger asChild value="preview">
                          <Button size="sm" variant="outline">
                            <EyeIcon className="w-4 h-4 mr-2" />
                            Preview
                          </Button>
                        </TabsTrigger>
                        <Button size="sm" variant="outline">
                          <StarIcon className="w-4 h-4 mr-2" />
                          Star
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline">
                              <FlipVerticalIcon className="w-4 h-4 mr-2" />
                              More
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <CopyIcon className="w-4 h-4 mr-2" />
                              Copy repository link
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Share2Icon className="w-4 h-4 mr-2" />
                              Embed code snippet
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <ShareIcon className="w-4 h-4 mr-2" />
                              Share repository
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TabsList>
                    </div>
                    <div className="bg-gray-900 rounded-lg overflow-hidden">
                      <div className="flex items-center justify-between bg-gray-800 px-4 py-2 border border-border">
                        <div className="flex items-center space-x-2">
                          <Button
                            className="text-gray-400 hover:text-white"
                            size="icon"
                            variant="ghost"
                          >
                            <CodeIcon className="w-4 h-4" />
                            <span className="sr-only">View code</span>
                          </Button>
                          <Separator
                            className="h-5 bg-gray-600"
                            orientation="vertical"
                          />
                          <Button
                            className="text-gray-400 hover:text-white"
                            size="icon"
                            variant="ghost"
                          >
                            <TerminalIcon className="w-4 h-4" />
                            <span className="sr-only">View terminal</span>
                          </Button>
                          <Separator
                            className="h-5 bg-gray-600"
                            orientation="vertical"
                          />
                          <Button
                            className="text-gray-400 hover:text-white"
                            size="icon"
                            variant="ghost"
                          >
                            <FileIcon className="w-4 h-4" />
                            <span className="sr-only">View files</span>
                          </Button>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            className="text-gray-400 hover:text-white"
                            size="icon"
                            variant="ghost"
                          >
                            <MaximizeIcon className="w-4 h-4" />
                            <span className="sr-only">Fullscreen</span>
                          </Button>
                          <Separator
                            className="h-5 bg-gray-600"
                            orientation="vertical"
                          />
                          <Button
                            className="text-gray-400 hover:text-white"
                            size="icon"
                            variant="ghost"
                          >
                            <SmartphoneIcon className="w-4 h-4" />
                            <span className="sr-only">Mobile view</span>
                          </Button>
                          <Separator
                            className="h-5 bg-gray-600"
                            orientation="vertical"
                          />
                          <Button
                            className="text-gray-400 hover:text-white"
                            size="icon"
                            variant="ghost"
                          >
                            <ComputerIcon className="w-4 h-4" />
                            <span className="sr-only">Desktop view</span>
                          </Button>
                        </div>
                      </div>

                      <TabsContent
                        className="bg-gray-800 text-white font-mono text-sm whitespace-pre-wrap border"
                        value="preview"
                      >
                        <ResizablePanelGroup
                          direction="horizontal"
                          className="flex"
                        >
                          <ResizablePanel
                            defaultSize={panelSize}
                            id="1"
                            maxSize={30}
                          />
                          <ResizableHandle withHandle />
                          <ResizablePanel defaultSize={100} minSize={40}>
                            <LiveProvider code={code} noInline scope={{}}>
                              <LivePreview className="w-full bg-white" />
                            </LiveProvider>
                          </ResizablePanel>
                          <ResizableHandle withHandle />
                          <ResizablePanel
                            defaultSize={panelSize}
                            id="2"
                            maxSize={30}
                          />
                        </ResizablePanelGroup>
                      </TabsContent>
                      <TabsContent
                        className="bg-gray-800 p-4 text-white font-mono text-sm whitespace-pre-wrap border overflow-scroll"
                        value="code"
                      >
                        <div
                          ref={shikiContainer}
                          className={
                            isLoaded
                              ? ""
                              : "flex justify-center items-center w-[30rem]"
                          }
                        >
                          <Spinner />
                        </div>
                      </TabsContent>
                    </div>
                  </Tabs>
                  <RepoDetails repo={repo} />
                </React.Fragment>
              )}
            </ClientOnly>
          </div>
        </div>
      </main>
    </div>
  );
}

const RepoDetails: React.FC<{
  repo: RepoNoSource | BackendCodeRepo | null;
}> = ({ repo }) => {
  React.useEffect(() => {
    if (repo === null) toast.error("Internal Server Error");
  }, []);

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mt-10">
      <h2 className="text-lg font-bold mb-4">About this repository</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-500 dark:text-gray-400">Owner</span>
          <span className="font-medium">{repo?.userId}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500 dark:text-gray-400">Last updated</span>
          <span className="font-medium">
            {new Date(repo?.updatedAt).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500 dark:text-gray-400">Price</span>
          <span className="font-medium">${repo?.price}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500 dark:text-gray-400">Language</span>
          <span className="font-medium">{repo?.language}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500 dark:text-gray-400">Visibility</span>
          <span className="font-medium">{repo?.visibility}</span>
        </div>
      </div>
    </div>
  );
};

function BellIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

function CodeIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function ComputerIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="14" height="8" x="5" y="2" rx="2" />
      <rect width="20" height="8" x="2" y="14" rx="2" />
      <path d="M6 18h2" />
      <path d="M12 18h6" />
    </svg>
  );
}

function CopyIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

function FileIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    </svg>
  );
}

function FlipVerticalIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3" />
      <path d="M21 16v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3" />
      <path d="M4 12H2" />
      <path d="M10 12H8" />
      <path d="M16 12h-2" />
      <path d="M22 12h-2" />
    </svg>
  );
}

function MaximizeIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 3H5a2 2 0 0 0-2 2v3" />
      <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
      <path d="M3 16v3a2 2 0 0 0 2 2h3" />
      <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}

function SearchIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function Share2Icon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
      <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
    </svg>
  );
}

function ShareIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" x2="12" y1="2" y2="15" />
    </svg>
  );
}

function SmartphoneIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
      <path d="M12 18h.01" />
    </svg>
  );
}

function StarIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function TerminalIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" x2="20" y1="19" y2="19" />
    </svg>
  );
}
