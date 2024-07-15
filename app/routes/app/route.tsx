import React from "react";
import { Outlet, redirect, useLoaderData } from "@remix-run/react";
import { ActionFunction, LoaderFunction } from "@remix-run/node";
import { ClientOnly } from "remix-utils/client-only";
import DashboardSidebar from "@/components/dashboard/sidebar";
import { Layout, LayoutBody } from "@/components/custom/layout";
import VerifyEmailComponent from "@/components/dashboard/verify-email";
import { useUserStore } from "@/stores/user-store";
import {
  sidebarLinks,
  settingsLink,
  SidebarLink,
} from "@/components/dashboard/constants";
import { sendVerifyEmailCodeFromUser } from "@/lib/fetcher/user";
import BannedBanner from "@/components/auth/banned";
import ExpiredBanner from "@/components/auth/expired";

export const loader: LoaderFunction = async ({ request }) => {
  const cookieHeader = request.headers.get("Cookie");
  const authCookie = cookieHeader
    ?.split(";")
    .find((cookie) => cookie.includes("auth_token"));
  if (!authCookie) redirect("/login", 401);
  return null;
};

export const action: ActionFunction = async ({ request }) => {
  const cookieHeader = request.headers.get("Cookie") ?? "";
  await sendVerifyEmailCodeFromUser(cookieHeader);
  return redirect("/app");
};

export default function DashboardLayout() {
  const [user, isLoading] = useUserStore((state) => [
    state.user,
    state.isLoading,
  ]);
  const [currentSidebarLinks, setCurrentSidebarLinks] = React.useState<
    SidebarLink[]
  >([]);

  React.useEffect(() => {
    if (user?.user?.role) {
      setCurrentSidebarLinks(
        sidebarLinks[user.user.role.toLowerCase()] || sidebarLinks.buyer,
      );
    }
  }, [user]);

  return (
    <div className="flex">
      <DashboardSidebar
        sidebarLinks={currentSidebarLinks}
        settingsLink={settingsLink}
      />
      <div className="flex-1 sm:pl-14">
        <Layout className="min-h-screen w-full flex flex-col">
          <LayoutBody>
            <main>
              <Outlet />
              <ClientOnly>
                {() => (
                  <React.Fragment>
                    {user?.user && !user?.user?.emailVerified ? (
                      <VerifyEmailComponent />
                    ) : null}
                    {user?.user && user?.user?.bannedUntil ? (
                      <BannedBanner />
                    ) : null}
                    {!user && !isLoading ? <ExpiredBanner /> : null}
                  </React.Fragment>
                )}
              </ClientOnly>
            </main>
          </LayoutBody>
        </Layout>
      </div>
    </div>
  );
}
