import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  json,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import { cookieConsent } from "@/utils/cookies.server";
import stylesheet from "@/tailwind.css?url";
import type {
  LinksFunction,
  LoaderFunction,
  ActionFunction,
} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Toaster } from "@/components/ui/sonner";
import CookieBanner from "@/components/landing/cookie-banner";
import { useDashboardStore } from "./stores/dashboard-store";
import { useEffect } from "react";
// import { json, LoaderFunction, ActionFunction } from "@remix-run/node";
//

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export const loader: LoaderFunction = async ({ request }) => {
  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await cookieConsent.parse(cookieHeader)) || {};
  const user = await fetch(`${process.env.BACKEND_URL}/api/v1/me`, {
    headers: {
      Cookie: cookieHeader ?? "",
    },
  }).then((res) => res.json());
  console.log(user);

  return json({
    showBanner: !cookie.accepted,
    user: user ?? {},
    ENV: {
      BACKEND_URL: process.env.BACKEND_URL,
    },
  });
};

declare global {
  interface Window {
    ENV: {
      BACKEND_URL: string;
    };
  }
}

export const action: ActionFunction = async ({ request }) => {
  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await cookieConsent.parse(cookieHeader)) || {};
  console.log(request);
  const formData = await request.formData();
  // console.log('POST', formData.get("analytics"))
  if (formData.get("analytics")) {
    cookie.accepted = true;
    cookie.value = {
      essential: true,
      analytics: formData.get("analytics") === "true",
    };
  }

  return redirect("/", {
    headers: {
      "Set-Cookie": await cookieConsent.serialize(cookie),
    },
  });
};

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useLoaderData<typeof loader>();
  const setUser = useDashboardStore((state) => state.setUser);

  useEffect(() => {
    if (data?.user?.id) {
      setUser(data.user);
    }
  });
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="dark">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(data?.ENV)}`,
          }}
        ></script>
        <ScrollRestoration />
        {data.showBanner && <CookieBanner />}
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <>
      <Toaster />
      <Outlet />
    </>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  return (
    <html lang="en">
      <head>
        <title>Oops!</title>
        <Meta />
        <Links />
      </head>
      <body>
        <h1>
          Error
          {isRouteErrorResponse(error)
            ? `${error.status} ${error.statusText}`
            : error instanceof Error
              ? error.message
              : "Unknown Error"}
        </h1>
        <Scripts />
      </body>
    </html>
  );
}
