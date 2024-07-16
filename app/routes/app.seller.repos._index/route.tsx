import React, { useState } from "react";
import { useLoaderData, useRouteError } from "@remix-run/react";
import { json, LoaderFunction, redirect } from "@remix-run/node";
import { ClientOnly } from "remix-utils/client-only";
import { z } from "zod";
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
import { Button } from "@/components/ui/button";
import { PlusIcon, SearchIcon } from "lucide-react";
import { Shell } from "@/components/landing/shell";
import { RepoForm } from "@/components/repo/new-repo-form";
import ErrorComponent from "@/components/error/500";
import { Skeleton } from "@/components/ui/skeleton";
import { checkAuthCookie } from "@/lib/router-guard";
import { showErrorToast } from "@/lib/handle-error";
import RepoCard from "@/components/repo/card-repo-seller";

const repoSchema = z.object({
  id: z.string(),
  userId: z.string(),
  sourceJs: z.string(),
  sourceCss: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
  visibility: z.enum(["public", "private"]),
  status: z.enum(["pending", "active", "rejected"]),
  name: z.string(),
  description: z.string(),
  language: z.enum(["JSX", "TSX"]),
  price: z.number(),
});

type Repo = z.infer<typeof repoSchema>;

export const loader: LoaderFunction = async ({ request }) => {
  if (!checkAuthCookie(request)) return redirect("/login");

  const cookieHeader = request.headers.get("Cookie");
  const res = await fetch(`${process.env.BACKEND_URL}/api/v1/repos/user`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Cookie: cookieHeader?.toString() ?? "",
    },
  });

  if (!res.ok) throw new Error("Failed to fetch repositories");

  const data = await res.json();
  const validatedData = z.array(repoSchema).parse(data);

  return json({
    repos: validatedData,
    success: true,
  });
};

export const ErrorBoundary = () => {
  const error = useRouteError();
  return <ErrorComponent />;
};

export default function RepoDashboard() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { repos } = useLoaderData<{ repos: Repo[] }>();

  const filteredRepos = repos.filter(
    (repo) =>
      repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${window.ENV.BACKEND_URL}/api/v1/repo/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete repository");
      }

      // Refresh the page to reflect the deletion
      window.location.reload();
    } catch (error) {
      showErrorToast(error);
    }
  };

  return (
    <ClientOnly fallback={<LoadingComponent />}>
      {() => (
        <div className="w-full min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
          <main className="flex-1 py-8 px-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Your Codebase
                </h1>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <Input
                      type="search"
                      placeholder="Search projects..."
                      className="pl-8 w-[200px] sm:w-[300px]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <PlusIcon className="w-4 h-4 mr-2" />
                        New Repo
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Create New Repo</DialogTitle>
                        <DialogDescription>
                          Fill out the form below to create a new project.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <RepoForm />
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {filteredRepos.length === 0 ? (
                <Shell className="flex flex-col items-center justify-center gap-2">
                  <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                    No Repos Found
                  </h3>
                  <p>Create your first repository</p>
                  <Button onClick={() => setDialogOpen(true)}>Create</Button>
                </Shell>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRepos.map((repo) => (
                    <RepoCard
                      key={repo.id}
                      repo={repo}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      )}
    </ClientOnly>
  );
}

function LoadingComponent() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <p className="text-gray-500 dark:text-gray-400">
          Please wait while we are preparing the content
        </p>
        <div className="flex items-center space-x-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
