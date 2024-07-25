import React from "react";
import { Outlet, redirect, useLoaderData, useLocation } from "@remix-run/react";
import { ActionFunction, LoaderFunction, json } from "@remix-run/node";
import { ClientOnly } from "remix-utils/client-only";
import DashboardSidebar from "@/components/dashboard/sidebar";
import { Layout, LayoutBody } from "@/components/custom/layout";
import VerifyEmailComponent from "@/components/dashboard/verify-email";
import { Me, useUserStore } from "@/stores/user-store";
import {
  sidebarLinks,
  settingsLink,
  SidebarLink,
} from "@/components/dashboard/constants";
//import { sendVerifyEmailCodeFromUser } from "@/lib/fetcher/user";
import BannedBanner from "@/components/auth/banned";
import ExpiredBanner from "@/components/auth/expired";

const accessRules: Record<Role, string[]> = {
  USER: ["/app/user", "/app/settings"],
  SELLER: ["/app/user", "/app/seller", "/app/settings"],
  MODERATOR: ["/app/mod", "/app/settings"],
  ADMIN: ["/app/admin", "/app/mod", "/app/settings"],
};

const hasAccess = (role: Role, path: string): boolean => {
  const allowedPaths = accessRules[role] || [];
  return allowedPaths.some((allowedPath) => path.startsWith(allowedPath));
};

export const loader: LoaderFunction = async ({ request }) => {
  const cookieHeader = request.headers.get("Cookie");
  const authCookie = cookieHeader
    ?.split(";")
    .find((cookie) => cookie.includes("auth_session"));
  if (!authCookie) return redirect("/login");

  try {
    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/me`, {
      headers: { Cookie: cookieHeader?.toString() ?? "" },
    });
    console.log(response);

    if (!response.ok) {
      if (response.status === 401) {
        return redirect("/login");
      }
      throw new Error("Failed to fetch user data");
    }

    const userData: Me = await response.json();
    const url = new URL(request.url);

    if (!hasAccess(userData.user.role, url.pathname)) {
      // Redirect to appropriate dashboard based on role
      switch (userData.user.role) {
        case "ADMIN":
          return redirect("/app/admin");
        case "MODERATOR":
          return redirect("/app/mod");
        case "SELLER":
          return redirect("/app/seller");
        default:
          return redirect("/app/user");
      }
    }

    return json({ user: userData });
  } catch (error) {
    console.error("Error in loader:", error);
    return redirect("/login");
  }
};

export default function DashboardLayout() {
  const { user } = useLoaderData<{ user: Me }>();
  const [currentSidebarLinks, setCurrentSidebarLinks] = React.useState<
    SidebarLink[]
  >([]);

  React.useEffect(() => {
    if (user?.user?.role) {
      setCurrentSidebarLinks(
        sidebarLinks[user.user.role.toUpperCase()] || sidebarLinks.buyer,
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
                    {user?.user && !user?.user?.emailVerified && (
                      <VerifyEmailComponent />
                    )}
                    {user?.user?.bannedUntil && <BannedBanner />}
                    {!user && <ExpiredBanner />}
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
