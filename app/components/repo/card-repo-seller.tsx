import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "@remix-run/react";
import { transform } from "sucrase";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Repo {
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
  onDelete?: (id: string) => void;
}

interface IframeRendererProps {
  sourceJs: string;
  sourceCss: string;
  language: "JSX" | "TSX";
  name: string;
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
  ({ sourceJs, sourceCss, language, name }) => {
    const [transformedCode, setTransformedCode] = useState<string>("");
    const [componentName, setComponentName] = useState<string>("");
    const [hasRenderMethod, setHasRenderMethod] = useState<boolean>(false);

    useEffect(() => {
      try {
        const codeWithoutImports = removeImports(sourceJs);
        const [extractedName, hasRender, codeWithoutRender] =
          extractComponentName(codeWithoutImports);

        setComponentName(extractedName || name);
        setHasRenderMethod(hasRender);

        const result = transformCode(codeWithoutRender);
        setTransformedCode(result);
      } catch (error) {
        console.error("Error transforming code:", error);
        toast.error("Failed to transform code");
        setHasRenderMethod(false);
      }
    }, [sourceJs, name]);

    const iframeSrcDoc = useMemo(
      () => `
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
          const Component = ${componentName};
          if (typeof Component === 'undefined') {
            document.getElementById('root').innerHTML = 'Component not found';
          } else {
            const domNode = document.getElementById('root');
            const root = ReactDOM.createRoot(domNode);
            root.render(React.createElement(Component));
          }
        </script>
      </body>
    </html>
  `,
      [sourceCss, language, transformedCode, componentName],
    );

    if (!hasRenderMethod) {
      return (
        <div className="w-full h-48 border rounded flex items-center justify-center bg-yellow-100 text-yellow-800">
          <p>
            Warning: No render method found. Unable to display component
            preview.
          </p>
        </div>
      );
    }

    return (
      <iframe
        srcDoc={iframeSrcDoc}
        className="w-full h-48 border rounded"
        title={name}
      />
    );
  },
);

IframeRenderer.displayName = "IframeRenderer";

const RepoCard: React.FC<RepoCardProps> = React.memo(({ repo, onDelete }) => {
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleDelete = useCallback(async () => {
    try {
      const response = await fetch(`/api/v1/repo/${repo.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete repository");
      }

      toast.success("Repository deleted successfully");
      onDelete?.(repo.id);
      setIsDeleteAlertOpen(false);
      navigate("/app/seller/repos");
    } catch (error) {
      console.error("Error deleting repo:", error);
      toast.error("Failed to delete repository");
    }
  }, [repo.id, onDelete, navigate]);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle>{repo.name}</CardTitle>
            <CardDescription className="line-clamp-1">
              {repo.description}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{repo.language}</Badge>
            <Badge variant="outline">${repo.price}</Badge>
            <Badge
              variant={repo.visibility === "public" ? "default" : "secondary"}
            >
              {repo.visibility}
            </Badge>
            <Badge
              variant={
                repo.status === "active"
                  ? "success"
                  : repo.status === "pending"
                    ? "warning"
                    : "destructive"
              }
            >
              {repo.status}
            </Badge>
          </div>
          <IframeRenderer
            sourceJs={repo.sourceJs}
            sourceCss={repo.sourceCss}
            language={repo.language}
            name={repo.name}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="w-full">Actions</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/app/seller/repos/${repo.id}/fullscreen`}>
                  View Fullscreen
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/app/seller/repos/${repo.id}/edit`}>Edit Repo</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setIsDeleteAlertOpen(true)}>
                Delete Repo
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this repo?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              repository and remove all associated data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
});

RepoCard.displayName = "RepoCard";

export { RepoCard, IframeRenderer };
export default RepoCard;
