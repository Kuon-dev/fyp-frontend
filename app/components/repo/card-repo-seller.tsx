import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Link, X } from "lucide-react";
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import IframeRenderer from "./editor-preview";
import { z } from "zod";

const repoSchema = z.object({
  id: z.string(),
  sourceJs: z.string(),
  sourceCss: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  language: z.enum(["JSX", "TSX"]),
  price: z.number(),
});

type Repo = z.infer<typeof repoSchema>;

interface RepoCardProps {
  repo: Repo;
}

const RepoCard: React.FC<RepoCardProps> = React.memo(({ repo }) => {
  const [isFullscreenOpen, setIsFullscreenOpen] = useState<boolean>(false);

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
              <DropdownMenuItem onSelect={() => setIsFullscreenOpen(true)}>
                View Fullscreen
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/app/user/repos/${repo.id}`}>View Details</Link>
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
