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
  Link,
  MoveHorizontalIcon,
  PlusIcon,
  SearchIcon,
} from "lucide-react";
import { ClientOnly } from "remix-utils/client-only";

import { ProjectForm } from "./form";

interface Project {
  id: number;
  title: string;
  description: string;
  iframeSrc: string;
  link: string;
}

const projects: Project[] = [
  {
    id: 1,
    title: "Project 1",
    description: "A simple landing page built with HTML, CSS, and JavaScript.",
    iframeSrc: "https://example.com/iframe1",
    link: "#",
  },
  {
    id: 2,
    title: "Project 2",
    description:
      "A responsive e-commerce website with a shopping cart and checkout process.",
    iframeSrc: "https://example.com/iframe2",
    link: "#",
  },
  {
    id: 3,
    title: "Project 3",
    description:
      "A data visualization dashboard with interactive charts and graphs.",
    iframeSrc: "https://example.com/iframe3",
    link: "#",
  },
  {
    id: 4,
    title: "Project 4",
    description:
      "A mobile-first web application for managing personal tasks and to-do lists.",
    iframeSrc: "https://example.com/iframe4",
    link: "#",
  },
  {
    id: 5,
    title: "Project 5",
    description: "A web-based game built with HTML5 canvas and JavaScript.",
    iframeSrc: "https://example.com/iframe5",
    link: "#",
  },
  {
    id: 6,
    title: "Project 6",
    description:
      "A responsive portfolio website showcasing my design and development work.",
    iframeSrc: "https://example.com/iframe6",
    link: "#",
  },
  {
    id: 7,
    title: "Project 7",
    description:
      "A web application for managing and tracking personal finances.",
    iframeSrc: "https://example.com/iframe7",
    link: "#",
  },
  {
    id: 8,
    title: "Project 8",
    description: "A description for project 8.",
    iframeSrc: "https://example.com/iframe8",
    link: "#",
  },
];

export default function Component() {
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
                  <Dialog>
                    <div className="relative">
                      <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <Input
                        type="search"
                        placeholder="Search projects..."
                        className="pl-8 w-[200px] sm:w-[300px]"
                      />
                    </div>
                    <DialogTrigger>
                      <Button variant="outline" size="sm">
                        <PlusIcon className="w-4 h-4 mr-2" />
                        New Pen
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Create New Pen</DialogTitle>
                        <DialogDescription>
                          Fill out the form below to create a new project.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <ProjectForm />
                      </div>
                      <DialogFooter>
                        <Button variant="outline">Cancel</Button>
                      </DialogFooter>
                    </DialogContent>
                    <Button variant="outline" size="sm">
                      <Grid3x3Icon className="w-4 h-4 mr-2" />
                      Grid View
                    </Button>
                  </Dialog>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {projects.map((project) => (
                  <Card
                    key={project.id}
                    className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow relative"
                  >
                    <Link to={project.link} className="block">
                      <iframe
                        src={project.iframeSrc}
                        title={project.title}
                        width="100%"
                        height="200"
                        className="w-full h-48 object-cover"
                        frameBorder="0"
                      />
                    </Link>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                          {project.title}
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
              <div className="flex justify-center mt-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious href="#" />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#">1</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#" isActive>
                        2
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#">3</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext href="#" />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          </main>
        </div>
      )}
    </ClientOnly>
  );
}
