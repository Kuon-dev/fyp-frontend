import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "@remix-run/react";
import { transform } from "sucrase";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { X, Download } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Repo {
  id: string;
  userId: string;
  sourceJs: string;
  sourceCss: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  visibility: "public" | "private";
  status: "pending" | "active" | "rejected";
  name: string;
  description: string;
  language: "JSX" | "TSX";
  price: number;
}

interface RepoCardProps {
  repo: Repo;
}

interface IframeRendererProps {
  sourceJs: string;
  sourceCss: string;
  language: "JSX" | "TSX";
  name: string;
  className?: string;
  fullscreen?: boolean;
}

const removeImports = (code: string): string => {
  return code.replace(
    /import\s+(?:(?:React|ReactDOM)(?:,|\s*{[^}]*})?|{[^}]*}|[\w\s,{}]*)\s+from\s+['"](?:react|react-dom)['"];?/g,
    "",
  );
};

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

const transformCode = (code: string) => {
  return transform(code, {
    transforms: ["jsx", "typescript"],
    production: true,
  }).code;
};

const IframeRenderer: React.FC<IframeRendererProps> = React.memo(
  ({ sourceJs, sourceCss, language, name, className, fullscreen = false }) => {
    const [iframeSrcDoc, setIframeSrcDoc] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [key, setKey] = useState(0); // Key for forcing re-render

    useEffect(() => {
      const processCode = async () => {
        setIsProcessing(true);
        try {
          const codeWithoutImports = removeImports(sourceJs);
          const [extractedName, hasRender, codeWithoutRender] =
            extractComponentName(codeWithoutImports);
          const finalComponentName = extractedName || name;

          if (!hasRender) {
            setError(
              "Warning: No render method found. Unable to display component preview.",
            );
            setIframeSrcDoc(null);
            return;
          }

          const transformedCode = await transformCode(codeWithoutRender);

          const newSrcDoc = `
            <html>
              <head>
                <style>${sourceCss}</style>
                <script src="https://cdn.tailwindcss.com"></script>
                <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
                <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
                ${language === "TSX" ? '<script src="https://unpkg.com/typescript@latest/lib/typescriptServices.js"></script>' : ""}
              </head>
              <body>
                <div id="root"></div>
                <script>
                  ${transformedCode}
                  (function() {
                    const Component = ${finalComponentName};
                    if (typeof Component === 'function' || (typeof Component === 'object' && Component !== null && typeof Component.$$typeof === 'symbol')) {
                      const domNode = document.getElementById('root');
                      const root = ReactDOM.createRoot(domNode);
                      root.render(React.createElement(Component));
                    } else {
                      document.getElementById('root').innerHTML = 'Component not found or not a valid React component';
                    }
                  })();
                </script>
              </body>
            </html>
          `;

          setIframeSrcDoc(newSrcDoc);
          setError(null);
        } catch (error) {
          console.error("Error processing code:", error);
          setError(error);
          setIframeSrcDoc(null);
        } finally {
          setIsProcessing(false);
          setKey((prevKey) => prevKey + 1); // Force re-render
        }
      };

      processCode();
    }, [sourceJs, sourceCss, language, name]);

    const containerClass = cn(
      "relative border rounded overflow-hidden",
      fullscreen ? "w-full h-full" : "w-full h-48",
      className,
    );

    return (
      <div className={containerClass}>
        <AnimatePresence mode="wait">
          {isProcessing && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center bg-muted/40 z-10"
            >
              <p>Processing component...</p>
            </motion.div>
          )}
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center bg-red-100 text-red-800 z-10"
            >
              <p>{error}</p>
            </motion.div>
          )}
          {iframeSrcDoc && !isProcessing && !error && (
            <motion.iframe
              key={`iframe-${key}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              srcDoc={iframeSrcDoc}
              className="w-full h-full"
              title={name}
              sandbox="allow-scripts"
            />
          )}
        </AnimatePresence>
      </div>
    );
  },
);

IframeRenderer.displayName = "IframeRenderer";

const RepoCard: React.FC<RepoCardProps> = React.memo(({ repo }) => {
  const [isFullscreenOpen, setIsFullscreenOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleDownload = useCallback((content: string, fileName: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const handleDownloadSourceCode = useCallback(() => {
    handleDownload(repo.sourceJs, `${repo.name}.js`);
    handleDownload(repo.sourceCss, `${repo.name}.css`);
    toast.success("Source code downloaded successfully");
  }, [repo, handleDownload]);

  return (
    <Card className="w-full h-full">
      <CardHeader className="w-full flex-stretch">
        <div className="flex flex-col items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle>{repo.name}</CardTitle>
            <CardDescription
              className={
                repo.description ? "line-clamp-1" : "line-clamp-1 opacity-0"
              }
            >
              {repo.description ?? "no desc"}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{repo.language}</Badge>
            <Badge variant="outline">${repo.price}</Badge>
          </div>
          <div className="flex-grow h-full w-full">
            <IframeRenderer
              sourceJs={repo.sourceJs}
              sourceCss={repo.sourceCss}
              language={repo.language}
              name={repo.name}
              className="h-48"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="w-full">Actions</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setIsFullscreenOpen(true)}>
                View Fullscreen
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/app/user/purchases/${repo.id}/edit`}>
                  Edit Repo
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleDownloadSourceCode}>
                <Download className="mr-2 h-4 w-4" />
                Download Source Code
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <Dialog open={isFullscreenOpen} onOpenChange={setIsFullscreenOpen}>
        <DialogContent className="max-w-full h-full m-0 p-0">
          <DialogHeader className="absolute top-0 left-0 right-0 bg-background/80 backdrop-blur-sm p-4 z-10">
            <div className="flex justify-between items-center">
              <DialogTitle>{repo.name} - Fullscreen Preview</DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFullscreenOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          <div className="h-full pt-16">
            <IframeRenderer
              sourceJs={repo.sourceJs}
              sourceCss={repo.sourceCss}
              language={repo.language}
              name={repo.name}
              fullscreen
            />
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
});

RepoCard.displayName = "RepoCard";

export { RepoCard, IframeRenderer };
export default RepoCard;
