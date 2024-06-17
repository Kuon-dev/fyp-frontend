//import React from "react"
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
import { Card, CardContent } from "@/components/ui/card";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  Grid3x3Icon,
  MoveHorizontalIcon,
  PlusIcon,
  SearchIcon,
} from "lucide-react";
import { ClientOnly } from "remix-utils/client-only";
import { Shell } from "@/components/landing/shell";

import { ProjectForm } from "./form";
import { LoaderFunction, json, redirect } from "@remix-run/node";
import { getRepoBySession } from "@/lib/fetcher/repo";
import { Link, useLoaderData } from "@remix-run/react";

export const loader: LoaderFunction = async ({ request }) => {
  if (!request.headers.get("Cookie")) throw redirect("/login", 401);

  const projects =
    (await getRepoBySession(request.headers.get("Cookie") ?? "")) ?? [];

  console.log(projects);
  return json({
    projects,
  });
};

export default function Component() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 16;

  const { projects } = useLoaderData<typeof loader>() as {
    projects: BackendCodeRepo[] | [];
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProjects = projects.slice(startIndex, endIndex);
  const totalPages = Math.ceil(projects.length / itemsPerPage);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <ClientOnly>
      {() => (
        <div className="w-full min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
          <main className="flex-1 py-8 px-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Your Codebase
                </h1>
                <div className="flex items-center gap-4">
                  <Dialog open={dialogOpen}>
                    <div className="relative">
                      <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <Input
                        type="search"
                        placeholder="Search projects..."
                        className="pl-8 w-[200px] sm:w-[300px]"
                      />
                    </div>
                    <DialogTrigger onClick={() => setDialogOpen(true)}>
                      <Button variant="outline" size="sm">
                        <PlusIcon className="w-4 h-4 mr-2" />
                        New Pen
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
                        <ProjectForm />
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
                    <Button variant="outline" size="sm">
                      <Grid3x3Icon className="w-4 h-4 mr-2" />
                      Grid View
                    </Button>
                  </Dialog>
                </div>
              </div>

              {projects.length === 0 && (
                <Shell className="flex flex-col items-center justify-center gap-2">
                  <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                    No Repos Found
                  </h3>
                  <p>Create your first repository</p>
                  <Button onClick={() => setDialogOpen(true)}>Create</Button>
                </Shell>
              )}

              {projects.length !== 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {paginatedProjects.map((project) => (
                    <Card
                      key={project.id}
                      className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow relative"
                    >
                      <Link
                        to={`${window.ENV.APP_URL}/${project.id}`}
                        className="block"
                      >
                        <iframe
                          src={`${window.ENV.APP_URL}/${project.id}`}
                          title={project.name}
                          width="100%"
                          height="200"
                          className="w-full h-48 object-cover"
                        />
                      </Link>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            {project.name}
                          </h3>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="ml-auto"
                              >
                                <MoveHorizontalIcon className="w-4 h-4" />
                                <span className="sr-only">Toggle menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Project</DropdownMenuItem>
                              <DropdownMenuItem>
                                View Project Details
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                          {project.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {projects.length > itemsPerPage && (
                <div className="flex justify-center mt-8">
                  <Pagination>
                    <PaginationContent>
                      {currentPage > 1 && (
                        <PaginationItem>
                          <PaginationPrevious onClick={handlePreviousPage} />
                        </PaginationItem>
                      )}
                      {Array.from({ length: totalPages }, (_, index) => (
                        <PaginationItem key={index}>
                          <PaginationLink
                            onClick={() => setCurrentPage(index + 1)}
                            isActive={currentPage === index + 1}
                          >
                            {index + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      {currentPage < totalPages && (
                        <PaginationItem>
                          <PaginationNext onClick={handleNextPage} />
                        </PaginationItem>
                      )}
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          </main>
        </div>
      )}
    </ClientOnly>
  );
}
