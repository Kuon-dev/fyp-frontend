import { Link, Outlet } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
// import { Separator } from "@/components/ui/separator";
// import { IconTool, IconUser } from "@tabler/icons-react";
// import SidebarNav from "@/elements/sidebar-nav";
// import { ClientOnly } from "remix-utils/client-only";
// import { TooltipProvider } from "@/components/ui/tooltip";
import DashboardSidebar from "@/elements/dashboard-sidebar";
import DashboardHeader from "@/elements/dashboard-header";
import { Layout, LayoutHeader, LayoutBody } from "@/components/custom/layout";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  if (request.url === "/repo") return redirect("/settings/profile");
  // else no redirect
  return {
    props: {},
  };
};

export default function repoLayout() {
  return (
    <div>
      <DashboardSidebar />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <Layout className="flex min-h-screen w-full flex-col relative">
          <LayoutBody>
            <main className="">
              <Repo />
            </main>
          </LayoutBody>
        </Layout>
      </div>
    </div>
  );
}

export function Repo() {
  return <Outlet />;
}
