import { Link, Outlet } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import DashboardSidebar from "@/elements/dashboard-sidebar";
import { Layout, LayoutHeader, LayoutBody } from "@/components/custom/layout";

// export const loader = async ({ request }: LoaderFunctionArgs) => {
//   return {
//     props: {},
//   };
// };

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