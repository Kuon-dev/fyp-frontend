import React from "react";
import { Link, Outlet } from "@remix-run/react";
import { Layout, LayoutHeader, LayoutBody } from "@/components/custom/layout";
import DashboardSidebar, { LinkProps } from "@/components/dashboard/sidebar";
import {
  adminSidebarLinks,
  moderatorSidebarLinks,
  sellerSidebarLinks,
  buyerSidebarLinks,
} from "@/components/dashboard/constants";
import { Settings } from "lucide-react";

type UserRole = "admin" | "moderator" | "seller" | "buyer";

export default function DashboardLayout() {
  const [sidebarLinks, setSidebarLinks] = React.useState<LinkProps[]>([]);
  const userRole = "admin"; // Replace this with dynamic role determination
  React.useEffect(() => {
    switch (userRole as UserRole) {
      case "admin":
        setSidebarLinks(adminSidebarLinks);
        break;
      case "moderator":
        setSidebarLinks(moderatorSidebarLinks);
        break;
      case "seller":
        setSidebarLinks(sellerSidebarLinks);
        break;
      case "buyer":
        setSidebarLinks(buyerSidebarLinks);
        break;
      default:
        setSidebarLinks(buyerSidebarLinks);
    }
  }, []);

  const settingsLink: LinkProps = {
    to: "/settings/profile",
    icon: <Settings className="h-5 w-5" />,
    tooltip: "Settings",
  };

  return (
    <div>
      <DashboardSidebar
        sidebarLinks={sidebarLinks}
        settingsLink={settingsLink}
      />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <Layout className="flex min-h-screen w-full flex-col relative">
          <LayoutBody>
            <main className="">
              <Outlet />
            </main>
          </LayoutBody>
        </Layout>
      </div>
    </div>
  );
}
