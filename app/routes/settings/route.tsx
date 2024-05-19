import { Link, Outlet } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Separator } from "@/components/ui/separator";
import { IconTool, IconUser } from "@tabler/icons-react";
import SidebarNav from "@/elements/sidebar-nav";
import { ClientOnly } from "remix-utils/client-only";
import { TooltipProvider } from "@/components/ui/tooltip";
import DashboardSidebar from "@/elements/dashboard-sidebar";
import DashboardHeader from "@/elements/dashboard-header";
import { Layout, LayoutHeader, LayoutBody } from "@/components/custom/layout";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  if (request.url === "/dashboard/settings")
    return redirect("/dashboard/settings/profile");
  // else no redirect
  return {
    props: {},
  };
};

export default function SettingsLayout() {
  return (
    <div>
      <DashboardSidebar />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <Layout className="flex min-h-screen w-full flex-col relative">
          <LayoutHeader>
            <DashboardHeader />
          </LayoutHeader>
          <LayoutBody>
            <main className="">
              <Settings />
            </main>
          </LayoutBody>
        </Layout>
      </div>
    </div>
  );
}

export function Settings() {
  return (
    <div>
      <div className="space-y-0.5">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your account settings and set e-mail preferences.
        </p>
      </div>
      <Separator className="my-6" />
      <div className="flex flex-1 flex-col space-y-8 overflow-auto lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="sticky top-0 lg:w-1/5">
          <SidebarNav items={sidebarNavItems} />
        </aside>
        <div className="w-full p-1 pr-4 lg:max-w-xl">
          <div className="pb-16">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

const sidebarNavItems = [
  {
    title: "Profile",
    icon: <IconUser size={18} />,
    href: "/settings",
  },
  {
    title: "Account",
    icon: <IconTool size={18} />,
    href: "/settings/account",
  },
  // {
  //   title: "Appearance",
  //   icon: <IconPalette size={18} />,
  //   href: "/settings/appearance",
  // },
  // {
  //   title: "Notifications",
  //   icon: <IconNotification size={18} />,
  //   href: "/settings/notifications",
  // },
  // {
  //   title: "Display",
  //   icon: <IconBrowserCheck size={18} />,
  //   href: "/settings/display",
  // },
  // {
  //   title: "Error Example",
  //   icon: <IconExclamationCircle size={18} />,
  //   href: "/settings/error-example",
  // },
];
