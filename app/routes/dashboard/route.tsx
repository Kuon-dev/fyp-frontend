import { Outlet } from "@remix-run/react";
import { ClientOnly } from "remix-utils/client-only";
import { TooltipProvider } from "@/components/ui/tooltip";
import DashboardSidebar from "@/elements/dashboard-sidebar";
import DashboardHeader from "@/elements/dashboard-header";
import { Layout, LayoutHeader, LayoutBody } from "@/components/custom/layout";
import {
  adminSidebarLinks,
  moderatorSidebarLinks,
  sellerSidebarLinks,
  buyerSidebarLinks,
} from "@/components/dashboard/constants";
import { Settings } from "lucide-react";

type UserRole = "admin" | "moderator" | "seller" | "buyer";

export interface LinkProps {
  to: string;
  icon: JSX.Element;
  tooltip: string;
}

const userRole = "admin"; // Replace this with dynamic role determination

let sidebarLinks: LinkProps[];
switch (userRole as UserRole) {
  case "admin":
    sidebarLinks = adminSidebarLinks;
    break;
  case "moderator":
    sidebarLinks = moderatorSidebarLinks;
    break;
  case "seller":
    sidebarLinks = sellerSidebarLinks;
    break;
  case "buyer":
    sidebarLinks = buyerSidebarLinks;
    break;
  default:
    sidebarLinks = buyerSidebarLinks; // Default to buyer if role is unknown
}

const settingsLink: LinkProps = {
  to: "/settings/profile",
  icon: <Settings className="h-5 w-5" />,
  tooltip: "Settings",
};

export default function DashboardLayout() {
  return (
    <ClientOnly>
      {() => (
        <TooltipProvider>
          <DashboardSidebar
            sidebarLinks={sidebarLinks}
            settingsLink={settingsLink}
          />
          ;
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
