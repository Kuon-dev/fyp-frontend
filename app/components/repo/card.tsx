// src/components/repo/card.tsx
import React, { forwardRef } from "react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { PencilIcon } from "lucide-react";
import { Spinner } from "@/components/custom/spinner";
import type { RepoNoSource } from "@/stores/search-store";

interface RepoCardProps {
  repo: RepoNoSource;
}

export const RepoCard = forwardRef<HTMLDivElement, RepoCardProps>(
  ({ repo }, ref) => {
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [name, setName] = React.useState(repo.name);
    const [description, setDescription] = React.useState(repo.description);
    const [loading, setLoading] = React.useState(true);
    const appUrl = window.ENV.APP_URL;

    const handleSave = () => {
      setDialogOpen(false);
    };

    const handleLoad = () => {
      setLoading(false);
    };

    const handleError = () => {
      setLoading(false);
    };

    return (
      <a
        href={`${appUrl}/preview/repo/${repo.id}`}
        className="block"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Card
          ref={ref}
          className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow relative"
        >
          <div className="dark:bg-gray-900 min-h-64 relative">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-800">
                <Spinner />
              </div>
            )}
            <iframe
              src={`${appUrl}/preview/repo/${repo.id}`}
              title={repo.name}
              width="100%"
              className="w-full h-48 object-cover"
              loading="lazy"
              onLoad={handleLoad}
              onError={handleError}
            />
          </div>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {repo.name}
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
              {repo.description}
            </p>
          </CardContent>
        </Card>
      </a>
    );
  },
);

RepoCard.displayName = "RepoCard";
