import { Outlet } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import DashboardSidebar, { LinkProps } from "@/elements/dashboard-sidebar";
import { Layout, LayoutBody } from "@/components/custom/layout";
import { checkAuthCookie } from "@/lib/router-guard";
import {
  adminSidebarLinks,
  moderatorSidebarLinks,
  sellerSidebarLinks,
  buyerSidebarLinks,
} from "@/components/dashboard/constants";
import { Settings } from "lucide-react";
import React from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  if (request.url === "/repo") return redirect("/settings/profile");

  if (!checkAuthCookie(request)) {
    return redirect("/login");
  }
  // else no redirect
  return {
    props: {},
  };
};

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
