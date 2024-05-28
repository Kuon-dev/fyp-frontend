import { Outlet } from "@remix-run/react";
import { ClientOnly } from "remix-utils/client-only";
import { TooltipProvider } from "@/components/ui/tooltip";
import DashboardSidebar from "@/elements/dashboard-sidebar";
import DashboardHeader from "@/elements/dashboard-header";
import { Layout, LayoutHeader, LayoutBody } from "@/components/custom/layout";

export default function DashboardLayout() {
  return (
    <ClientOnly>
      {() => (
        <TooltipProvider>
          <DashboardSidebar />
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
