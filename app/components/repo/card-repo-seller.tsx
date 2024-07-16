import React, { useState } from "react";
import { Link, useNavigate } from "@remix-run/react";
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

export default function RepoCard({ repo, onDelete }: RepoCardProps) {
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleDelete = async () => {
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
      navigate("/app/seller/repos"); // Redirect to the repos list page
    } catch (error) {
      console.error("Error deleting repo:", error);
      toast.error("Failed to delete repository");
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle>{repo.name}</CardTitle>
            <CardDescription className="line-clamp-2">
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
          <iframe
            srcDoc={`
              <html>
                <head>
                  <style>${repo.sourceCss}</style>
                </head>
                <body>
                  <div id="root"></div>
                  <script type="module">
                    ${repo.sourceJs}
                  </script>
                </body>
              </html>
            `}
            className="w-full h-48 border rounded"
            title={repo.name}
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
}
