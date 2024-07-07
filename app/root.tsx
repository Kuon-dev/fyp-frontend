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
  SerializeFrom,
} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Toaster } from "@/components/ui/sonner";
import CookieBanner from "@/components/landing/cookie-banner";
import { Me, useDashboardStore } from "./stores/dashboard-store";
import { useEffect } from "react";
import { getCurrentUserProfileData } from "./lib/fetcher/user";
import BannedBanner from "./components/auth/banned";
import {
  ExternalScripts,
  ExternalScriptsHandle,
} from "remix-utils/external-scripts";

type LoaderData = SerializeFrom<typeof loader>;

// export const handle: ExternalScriptsHandle<LoaderData> = {
//   scripts({ id, data, params, matches, location, parentsData }) {
//     return [
//       {
//         src: "https://js.stripe.com/v3/",
//         crossOrigin: "anonymous",
//       },
//     ];
//   },
// };

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export const loader: LoaderFunction = async ({ request }) => {
  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await cookieConsent.parse(cookieHeader)) || {};
  let user: Me | null = null;
  try {
    if (cookieHeader) {
      const res = await fetch(`${process.env.BACKEND_URL}/api/v1/me`, {
        headers: {
          Cookie: cookieHeader,
        },
      }).then((r) => r.json());
      console.log(res);
      user = res ?? null;
      //if (res.ok) {
      //  if (res.status !== 204)
      //  console.log('204')
      //  user = await res.json() ?? null
      //  console.log(user)
      //}
    }
  } catch (e) {
    if (e instanceof Response && e.status === 401) {
      // return redirect("/login");
    }
  }

  return json({
    showBanner: !cookie.accepted,
    userData: user,
    ENV: {
      BACKEND_URL: process.env.BACKEND_URL,
      APP_URL: process.env.APP_URL,
    },
  });
};

declare global {
  interface Window {
    ENV: {
      BACKEND_URL: string;
      APP_URL: string;
    };
  }
}

export const action: ActionFunction = async ({ request }) => {
  // set cookie consent
  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await cookieConsent.parse(cookieHeader)) || {};
  const formData = await request.formData();
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
  const data = useLoaderData<typeof loader>() as {
    showBanner: boolean;
    userData: Me | null;
    ENV: {
      BACKEND_URL: string;
    };
  };
  const setUser = useDashboardStore((state) => state.setUser);

  useEffect(() => {
    const userData = data?.userData ?? null;
    if (userData) {
      setUser(userData);
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
        <ExternalScripts />
        {data?.userData?.user.bannedUntil && <BannedBanner />}
        {data?.showBanner && <CookieBanner />}
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
