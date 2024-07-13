import React from "react";
import {
  // Link,
  Outlet,
  // json,
  redirect,
  // useNavigate,
} from "@remix-run/react";
import DashboardSidebar, { LinkProps } from "@/components/dashboard/sidebar";
import { Layout, LayoutHeader, LayoutBody } from "@/components/custom/layout";
import {
  adminSidebarLinks,
  moderatorSidebarLinks,
  sellerSidebarLinks,
  buyerSidebarLinks,
} from "@/components/dashboard/constants";
import { Settings } from "lucide-react";
import VerifyEmailComponent from "@/components/dashboard/verify-email";
import { useUserStore } from "@/stores/user-store";
import { LoaderFunction } from "@remix-run/node";
import { ClientOnly } from "remix-utils/client-only";

export const loader: LoaderFunction = async ({ request }) => {
  const cookieHeader = request.headers.get("Cookie");
  const authCookie = cookieHeader
    ?.split(";")
    .find((cookie) => cookie.includes("auth_session"));
  if (!authCookie) throw redirect("/login", 401);

  return "";
};

export default function DashboardLayout() {
  const [sidebarLinks, setSidebarLinks] = React.useState<LinkProps[]>([]);
  const [user] = useUserStore((state) => [state.user]);
  React.useEffect(() => {
    switch (user?.user?.role) {
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
  }, [user]);

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
              <ClientOnly>
                {() =>
                  user?.user?.emailVerified ? <div /> : <VerifyEmailComponent />
                }
              </ClientOnly>
            </main>
          </LayoutBody>
        </Layout>
      </div>
    </div>
  );
}
