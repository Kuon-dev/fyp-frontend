import { Link } from "@remix-run/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CardContent, Card } from "@/components/ui/card";
import {
  PaginationPrevious,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationContent,
  Pagination,
} from "@/components/ui/pagination";

const projects = [
  {
    id: 1,
    title: "Project 1",
    description: "A simple landing page built with HTML, CSS, and JavaScript.",
    image: "/placeholder.svg",
  },
  {
    id: 2,
    title: "Project 2",
    description:
      "A responsive e-commerce website with a shopping cart and checkout process.",
    image: "/placeholder.svg",
  },
  {
    id: 3,
    title: "Project 3",
    description:
      "A data visualization dashboard with interactive charts and graphs.",
    image: "/placeholder.svg",
  },
  {
    id: 4,
    title: "Project 4",
    description:
      "A mobile-first web application for managing personal tasks and to-do lists.",
    image: "/placeholder.svg",
  },
  {
    id: 5,
    title: "Project 5",
    description: "A web-based game built with HTML5 canvas and JavaScript.",
    image: "/placeholder.svg",
  },
  {
    id: 6,
    title: "Project 6",
    description:
      "A responsive portfolio website showcasing my design and development work.",
    image: "/placeholder.svg",
  },
  {
    id: 7,
    title: "Project 7",
    description:
      "A web application for managing and tracking personal finances.",
    image: "/placeholder.svg",
  },
  {
    id: 8,
    title: "Project 8",
    description:
      "A web-based chat application with real-time messaging and notifications.",
    image: "/placeholder.svg",
  },
];

const itemsPerPage = 4;

export default function Component() {
  const [currentPage, setCurrentPage] = useState(1);

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < Math.ceil(projects.length / itemsPerPage))
      setCurrentPage(currentPage + 1);
  };

  const displayedProjects = projects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="w-full min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      <main className="flex-1 py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Your Codebase
            </h1>
            <div className="flex items-center gap-4">
              <Button size="sm" variant="outline">
                <PlusIcon className="w-4 h-4 mr-2" />
                New Pen
              </Button>
              <Button size="sm" variant="outline">
                <LayoutGridIcon className="w-4 h-4 mr-2" />
                Grid View
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayedProjects.map((project) => (
              <Card
                key={project.id}
                className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <Link className="block" href="#">
                  <img
                    alt="Project Thumbnail"
                    className="w-full h-48 object-cover"
                    height="200"
                    src={project.image}
                    style={{
                      aspectRatio: "300/200",
                      objectFit: "cover",
                    }}
                    width="300"
                  />
                </Link>
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {project.title}
                  </h3>
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
                  <PaginationPrevious href="#" onClick={handlePrevious} />
                </PaginationItem>
                {[
                  ...Array(Math.ceil(projects.length / itemsPerPage)).keys(),
                ].map((_, index) => (
                  <PaginationItem key={index}>
                    <PaginationLink
                      href="#"
                      isActive={index + 1 === currentPage}
                      onClick={() => setCurrentPage(index + 1)}
                    >
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext href="#" onClick={handleNext} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </main>
    </div>
  );
}

function LayoutGridIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
  );
}

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
