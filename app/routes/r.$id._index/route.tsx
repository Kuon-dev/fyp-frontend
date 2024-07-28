import React, { useState, useEffect, useCallback, useRef } from "react";
import { json, useLoaderData, useNavigate } from "@remix-run/react";
import {
  SmartphoneIcon,
  StarIcon,
  ComputerIcon,
  CopyIcon,
  FlipVerticalIcon,
  MaximizeIcon,
  DollarSignIcon,
  TabletIcon,
  Code2,
  DollarSign,
  Clock,
  Download,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenu,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { ClientOnly } from "remix-utils/client-only";
import { LoaderFunction } from "@remix-run/node";
import type { RepoResponse } from "@/lib/fetcher/repo";
import { toast } from "sonner";
import ReviewComponent from "@/components/repo/review";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { showErrorToast } from "@/lib/handle-error";
import { useCheckoutStore } from "@/stores/checkout-store";
import CodeAnalysis, {
  PublicCodeCheckResult,
} from "@/components/repo/code-analysis";
import { useUserStore } from "@/stores/user-store";

export const loader: LoaderFunction = async ({ params }) => {
  const id = params.id;
  let data;
  try {
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/v1/repo/${id}/public`,
      {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    if (response.ok) {
      data = await response.json();
    }
  } catch (error: unknown) {
    console.log(error);
  }
  return json({
    repo: data?.repo,
    codeCheck: data?.repoCodeCheck,
  });
};

export default function RepoPreviewComponent() {
  const { repo, codeCheck } = useLoaderData<{
    repo: RepoResponse | null;
    codeCheck: PublicCodeCheckResult | null;
  }>();
  const [showCodeAnalysis, setShowCodeAnalysis] = useState(false);

  if (!repo) {
    return <div>Repository not found</div>;
  }

  const copyRepoLink = () => {
    const repoLink = `${window?.ENV.APP_URL}/repo/${repo.id}`;
    navigator.clipboard
      .writeText(repoLink)
      .then(() => {
        toast.success("Repository link copied to clipboard!");
      })
      .catch(() => {
        toast.error("Failed to copy repository link.");
      });
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <ClientOnly>
        {() => (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-5xl font-bold mb-2">{repo.name}</h1>
                <div className="flex items-center mt-2">
                  <DollarSignIcon className="w-4 h-4 mr-1 text-green-500" />
                  <span className="font-semibold">
                    ${repo.price.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowCodeAnalysis(true)}
                >
                  View Code Analysis
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline">
                      <FlipVerticalIcon className="w-4 h-4 mr-2" />
                      More
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={copyRepoLink}>
                      <CopyIcon className="w-4 h-4 mr-2" />
                      Copy repository link
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="bg-muted/40 rounded-lg">
              <ResizablePanel>
                <div className="h-screen overflow-scroll">
                  <iframe
                    title={repo.id}
                    src={`${window?.ENV.APP_URL}/preview/repo/${repo.id}`}
                    key={repo.id}
                    className="w-full h-full"
                    loading="lazy"
                  />
                </div>
              </ResizablePanel>
            </div>

            <div>
              <Price repo={repo} />
            </div>

            <div>
              <ReviewComponent repoId={repo.id} />
            </div>

            {codeCheck && (
              <CodeAnalysis
                isOpen={showCodeAnalysis}
                onClose={() => setShowCodeAnalysis(false)}
                codeCheckResult={codeCheck}
                repoName={repo.name}
                repoLanguage={repo.language}
                isPublicView={true}
              />
            )}
          </>
        )}
      </ClientOnly>
    </div>
  );
}

interface ResizablePanelProps {
  children: React.ReactNode;
  initialWidth?: number;
  minWidth?: number;
  maxWidth?: number;
}

const ResizablePanel: React.FC<ResizablePanelProps> = ({
  children,
  initialWidth = 1080,
  minWidth = 320,
  maxWidth = 1920,
}) => {
  const [width, setWidth] = useState(initialWidth);
  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);
  const isLeftResizeRef = useRef(false);

  const mobileWidth = 375;
  const tabletWidth = 768;
  const desktopWidth = 1080;

  const startResize = useCallback(
    (
      e:
        | React.MouseEvent<HTMLButtonElement>
        | React.TouchEvent<HTMLButtonElement>,
      isLeft: boolean,
    ) => {
      setIsResizing(true);
      startXRef.current = "touches" in e ? e.touches[0].clientX : e.clientX;
      startWidthRef.current = width;
      isLeftResizeRef.current = isLeft;
    },
    [width],
  );

  const stopResize = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isResizing) return;

      const currentX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const diff = currentX - startXRef.current;
      const newWidth = isLeftResizeRef.current
        ? Math.max(
            minWidth,
            Math.min(maxWidth, startWidthRef.current - diff * 2),
          )
        : Math.max(
            minWidth,
            Math.min(maxWidth, startWidthRef.current + diff * 2),
          );

      setWidth(newWidth);
    },
    [isResizing, minWidth, maxWidth],
  );

  useEffect(() => {
    const handleResize = (e: MouseEvent | TouchEvent) => resize(e);
    const handleStopResize = () => stopResize();

    if (isResizing) {
      document.addEventListener("mousemove", handleResize);
      document.addEventListener("touchmove", handleResize);
      document.addEventListener("mouseup", handleStopResize);
      document.addEventListener("touchend", handleStopResize);
    }

    return () => {
      document.removeEventListener("mousemove", handleResize);
      document.removeEventListener("touchmove", handleResize);
      document.removeEventListener("mouseup", handleStopResize);
      document.removeEventListener("touchend", handleStopResize);
    };
  }, [isResizing, resize, stopResize]);

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    isLeft: boolean,
  ) => {
    const step = 10;
    if (e.key === "ArrowLeft") {
      setWidth((w) => Math.max(minWidth, isLeft ? w + step : w - step));
    } else if (e.key === "ArrowRight") {
      setWidth((w) => Math.min(maxWidth, isLeft ? w - step : w + step));
    }
  };

  return (
    <div className="flex flex-col items-center w-full justify-center">
      <div className="w-full justify-center">
        <div className="flex space-x-2 mb-4 mt-4 border border-gray-800 rounded-lg bg-black w-full py-3 justify-center items-center">
          <Button
            onClick={() => setWidth(mobileWidth)}
            className="text-slate-400 hover:text-white"
            size="icon"
            variant="ghost"
          >
            <SmartphoneIcon className="w-4 h-4" />
            <span className="sr-only">Mobile view</span>
          </Button>
          <Separator orientation="vertical" className="border-white h-8" />
          <Button
            onClick={() => setWidth(tabletWidth)}
            className="text-slate-400 hover:text-white"
            size="icon"
            variant="ghost"
          >
            <TabletIcon className="w-4 h-4" />
            <span className="sr-only">Tablet view</span>
          </Button>
          <Separator orientation="vertical" className="border-white h-8" />
          <Button
            onClick={() => setWidth(desktopWidth)}
            className="text-slate-400 hover:text-white"
            size="icon"
            variant="ghost"
          >
            <ComputerIcon className="w-4 h-4" />
            <span className="sr-only">Desktop view</span>
          </Button>
        </div>
      </div>
      <div
        className="relative mx-auto h-full overflow-visible border border-slate-850"
        style={{ width: `${width}px` }}
      >
        <button
          aria-label="Resize panel from left"
          onMouseDown={(e) => startResize(e, true)}
          onTouchStart={(e) => startResize(e, true)}
          onKeyDown={(e) => handleKeyDown(e, true)}
          className="absolute top-[50%] -left-2.5 w-2.5 cursor-ew-resize bg-transparent bg-gray-700 transition-colors h-10 rounded-lg"
        />
        <button
          aria-label="Resize panel from right"
          onMouseDown={(e) => startResize(e, false)}
          onTouchStart={(e) => startResize(e, false)}
          onKeyDown={(e) => handleKeyDown(e, false)}
          className="absolute top-[50%] -right-2.5 w-2.5 cursor-ew-resize bg-transparent bg-gray-700 transition-colors h-10 rounded-lg"
        />
        {children}
      </div>
    </div>
  );
};

function Price({ repo }: { repo: RepoResponse }) {
  const navigate = useNavigate();
  const { clientSecret, handlePurchase, isLoading } = useCheckoutStore();
  const { isLoggedIn } = useUserStore();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const onPurchaseClick = async () => {
    if (!isLoggedIn) {
      toast("Please log in to make a purchase", {
        action: {
          label: "Login",
          onClick: () => {
            navigate("/login");
          },
        },
      });
      return;
    }

    try {
      const success = await handlePurchase(repo.id);
      if (success) {
        if (clientSecret) navigate(`/checkout/${clientSecret}`);
      } else {
        throw new Error("Failed to initialize checkout");
      }
    } catch (error) {
      showErrorToast(error);
    }
  };

  return (
    <div className="w-full mx-auto p-4">
      <Card className="w-full shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center space-x-2">
            <Code2 className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl font-bold">{repo.name}</CardTitle>
          </div>
          <CardDescription className="mt-2 text-base">
            {repo.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex flex-wrap justify-between items-center mb-4">
            <Badge variant="outline" className="text-sm px-3 py-1">
              {repo.language}
            </Badge>
            <Badge className="text-sm px-3 py-1">{repo.status}</Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-gray-500 mr-2" />
              <span>Created {formatDate(repo.createdAt)}</span>
            </div>
          </div>
          <div className="flex items-center justify-center bg-primary/10 rounded-lg p-4">
            <DollarSign className="h-10 w-10 text-primary mr-2" />
            <span className="text-5xl font-bold text-primary">
              {repo.price.toFixed(2)}
            </span>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center pt-4">
          <Button
            size="lg"
            className="w-full sm:w-auto"
            onClick={onPurchaseClick}
            disabled={isLoading || !isLoggedIn}
          >
            {isLoading
              ? "Processing..."
              : isLoggedIn
                ? "Purchase Now"
                : "Login to Purchase"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
