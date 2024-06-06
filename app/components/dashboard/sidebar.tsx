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

export interface LinkProps {
  to: string;
  icon: JSX.Element;
  tooltip: string;
}

interface DashboardSidebarProps {
  sidebarLinks: LinkProps[];
  settingsLink: LinkProps;
}

export default function DashboardSidebar({
  sidebarLinks,
  settingsLink,
}: DashboardSidebarProps) {
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
                <TooltipContent side="right">
                  {settingsLink.tooltip}
                </TooltipContent>
              </Tooltip>
            </nav>
          </aside>
        </TooltipProvider>
      )}
    </ClientOnly>
  );
}

function DashboardSidebarFallback({
  sidebarLinks,
  settingsLink,
}: DashboardSidebarProps) {
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
        {sidebarLinks.map((_, index) => (
          <div key={index}>
            <Skeleton className="h-12 w-12 rounded-full" />
          </div>
        ))}
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
        <Link
          to={settingsLink.to}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground md:h-8 md:w-8"
        >
          {settingsLink.icon}
          <span className="sr-only">{settingsLink.tooltip}</span>
        </Link>
      </nav>
    </aside>
  );
}
