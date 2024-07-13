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
import { ActionFunction, LoaderFunction } from "@remix-run/node";
import { ClientOnly } from "remix-utils/client-only";

export const loader: LoaderFunction = async ({ request }) => {
  const cookieHeader = request.headers.get("Cookie");
  const authCookie = cookieHeader
    ?.split(";")
    .find((cookie) => cookie.includes("auth_session"));
  if (!authCookie) throw redirect("/login", 401);

  return "";
};

export const action: ActionFunction = async ({ request }) => {
  const cookieHeader = request.headers.get("Cookie") ?? "";
  const response = await fetch(
    `${process.env.BACKEND_URL}/api/v1/send-verify-code`,
    {
      method: "POST",
      headers: {
        Cookie: cookieHeader,
      },
    },
  );
  if (response.ok) {
    return true;
  } else {
    return redirect("/app");
  }
};

export default function DashboardLayout() {
  const [sidebarLinks, setSidebarLinks] = React.useState<LinkProps[]>([]);
  const [user] = useUserStore((state) => [state.user]);
  return <div>dashboard</div>;
}
