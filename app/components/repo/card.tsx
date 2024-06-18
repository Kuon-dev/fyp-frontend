// src/components/repo/card.tsx
import React, { useState } from "react";
import { Link } from "@remix-run/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { RepoForm } from "./new-repo-form";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { PencilIcon } from "lucide-react";

interface RepoCardProps {
  repo: {
    id: string;
    name: string;
    description: string;
    language: string;
    tags: string[];
    price: number;
    visibility: BackendVisibility;
  };
}

export const RepoCard: React.FC<RepoCardProps> = ({ repo }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const appUrl = window.ENV.APP_URL;

  const handleSave = () => {
    // Implement save logic here
    setDialogOpen(false);
  };

  return (
    <Card
      key={repo.id}
      className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow relative"
    >
      <Link to={`${appUrl}/${repo.id}`} className="block">
        <iframe
          src={`${appUrl}/${repo.id}`}
          title={repo.name}
          width="100%"
          height="200"
          className="w-full h-48 object-cover"
        />
      </Link>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {repo.name}
          </h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-auto">
                <PencilIcon className="w-4 h-4" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      className="w-full text-left"
                      onClick={() => setDialogOpen(true)}
                    >
                      Edit repo
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit repo</DialogTitle>
                      <DialogDescription>
                        Modify the repo details below.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <RepoForm defaultValues={repo} />
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleSave}>Save</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
          {repo.description}
        </p>
      </CardContent>
    </Card>
  );
};
