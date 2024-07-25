import React from "react";
import { Link } from "@remix-run/react";
import { Package2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientOnly } from "remix-utils/client-only";
import { ExitIcon } from "@radix-ui/react-icons";

// Define the LinkProps interface
export interface LinkProps {
  to: string;
  icon: React.ReactNode;
  tooltip: string;
}

// Define the DashboardSidebarProps interface
interface DashboardSidebarProps {
  sidebarLinks: LinkProps[];
  settingsLink: LinkProps;
}

// Main DashboardSidebar component
export default function DashboardSidebar({
  sidebarLinks,
  settingsLink,
}: DashboardSidebarProps) {
  const handleLogout = async () => {
    const res = await fetch(`${window.ENV.BACKEND_URL}/api/v1/logout`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (res.ok) {
      window.location.href = "/login";
    }
  };

  return (
    <ClientOnly
      fallback={
        <DashboardSidebarFallback
          sidebarLinks={sidebarLinks}
          settingsLink={settingsLink}
        />
      }
    >
      {() => (
        <TooltipProvider>
          <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
            <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
              <Link
                to="/"
                className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
              >
                <Package2 className="h-4 w-4 transition-all group-hover:scale-110" />
                <span className="sr-only">Kortex</span>
              </Link>
              {sidebarLinks.map((link, index) => (
                <SidebarLink key={index} {...link} />
              ))}
            </nav>
            <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleLogout}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground md:h-8 md:w-8"
                  >
                    <ExitIcon className="h-5 w-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Logout</TooltipContent>
              </Tooltip>
              <SidebarLink {...settingsLink} />
            </nav>
          </aside>
        </TooltipProvider>
      )}
    </ClientOnly>
  );
}

// SidebarLink component for individual links
const SidebarLink: React.FC<LinkProps> = ({ to, icon, tooltip }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Link
        to={to}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
      >
        {icon}
        <span className="sr-only">{tooltip}</span>
      </Link>
    </TooltipTrigger>
    <TooltipContent side="right">{tooltip}</TooltipContent>
  </Tooltip>
);

// DashboardSidebarFallback component for loading state
function DashboardSidebarFallback({
  sidebarLinks,
  settingsLink,
}: DashboardSidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <div className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base">
          <Package2 className="h-4 w-4 transition-all group-hover:scale-110" />
          <span className="sr-only">Kortex</span>
        </div>
        {[1, 2, 3, 4, 5].map((_, index) => (
          <div key={index}>
            <Skeleton className="h-12 w-12 rounded-full" />
          </div>
        ))}
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground md:h-8 md:w-8">
          {settingsLink.icon}
          <span className="sr-only">{settingsLink.tooltip}</span>
        </div>
      </nav>
    </aside>
  );
}
