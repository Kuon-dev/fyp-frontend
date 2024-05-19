import { LazyImage } from "@/components/custom/image";
import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "@remix-run/react";
import { ClientOnly } from "remix-utils/client-only";
import {
  Home,
  LineChart,
  Package,
  Package2,
  PanelLeft,
  Search,
  Settings,
  ShoppingCart,
  Users2,
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  // DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDashboardStore } from "@/stores/dashboard-store";
import { Layout, LayoutHeader, LayoutBody } from "@/components/custom/layout";

const Image = LazyImage;

const sidebarLinks = [
  { to: "#", icon: <Home className="h-5 w-5" />, tooltip: "Dashboard" },
  { to: "#", icon: <ShoppingCart className="h-5 w-5" />, tooltip: "Orders" },
  { to: "#", icon: <Package className="h-5 w-5" />, tooltip: "Products" },
  { to: "#", icon: <Users2 className="h-5 w-5" />, tooltip: "Customers" },
  { to: "#", icon: <LineChart className="h-5 w-5" />, tooltip: "Analytics" },
];

const settingsLink = {
  to: "#",
  icon: <Settings className="h-5 w-5" />,
  tooltip: "Settings",
};

const prependDashboard = (path: string | undefined) => {
  if (!path) return "/dashboard";
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  const newPath = `/dashboard/${cleanPath}`;
  return newPath;
};

export default function DashboardLayout() {
  return (
    <ClientOnly>
      {() => (
        <TooltipProvider>
          <SidebarLinks />
          <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
            <Layout className="flex min-h-screen w-full flex-col relative">
              <LayoutHeader>
                <DashboardHeader />
              </LayoutHeader>
              <LayoutBody>
                <main className="">
                  <Outlet />
                </main>
              </LayoutBody>
            </Layout>
          </div>
        </TooltipProvider>
      )}
    </ClientOnly>
  );
}

function DashboardHeader() {
  const { user, breadcrumbs, setUser, setBreadcrumbs } = useDashboardStore();
  const loc = useLocation();

  useEffect(() => {
    // Fetch user details and set user state
    const fetchUser = async () => {
      const userData = await fetchUserDetails(); // Implement fetchUserDetails to fetch user data
      setUser(userData);
    };

    fetchUser();

    // Set breadcrumbs based on current route
    const path = loc.pathname.split("/").filter(Boolean);
    const currentBreadcrumbs = path.map((p, index) => ({
      // captialize first letter of path
      label: p.charAt(0).toUpperCase() + p.slice(1),
      link: path.slice(1, index + 1).join("/"),
    }));
    setBreadcrumbs(currentBreadcrumbs);
  }, [loc.pathname]);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static h-auto sm:bg-transparent sm:px-6 w-full">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              to="#"
              className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
            >
              <Package2 className="h-5 w-5 transition-all group-hover:scale-110" />
              <span className="sr-only">Acme Inc</span>
            </Link>
            {sidebarLinks.map((link, index) => (
              <Link
                key={index}
                to={link.to}
                className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
              >
                {link.icon}
                {link.tooltip}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          {breadcrumbs.map((breadcrumb, index) => (
            <React.Fragment key={index}>
              <BreadcrumbItem>
                {prependDashboard(breadcrumb.link) !== loc.pathname ? (
                  <BreadcrumbLink asChild>
                    <Link to={breadcrumb.link ?? "#"}>{breadcrumb.label}</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>{" "}
      <div className="relative ml-auto flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
        />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="overflow-hidden rounded-full"
          >
            {user && (
              <Image
                src={user.avatar}
                width={36}
                height={36}
                alt="Avatar"
                className="overflow-hidden rounded-full"
              />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuItem>Support</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

function SidebarLinks() {
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <Link
          to="#"
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
        >
          <Package2 className="h-4 w-4 transition-all group-hover:scale-110" />
          <span className="sr-only">Acme Inc</span>
        </Link>
        {sidebarLinks.map((link, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <Link
                to={link.to}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
              >
                {link.icon}
                <span className="sr-only">{link.tooltip}</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">{link.tooltip}</TooltipContent>
          </Tooltip>
        ))}
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              to={settingsLink.to}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
            >
              {settingsLink.icon}
              <span className="sr-only">{settingsLink.tooltip}</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">{settingsLink.tooltip}</TooltipContent>
        </Tooltip>
      </nav>
    </aside>
  );
}

// Mock function to simulate fetching user details
async function fetchUserDetails() {
  return {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "/placeholder-user.jpg",
  };
}
