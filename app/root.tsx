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
import { useUserStore } from "./stores/user-store";
import { useEffect } from "react";
import { ExternalScripts } from "remix-utils/external-scripts";
import { cssBundleHref } from "@remix-run/css-bundle";
import sonnerStyles from "@/../styles/sonner.css?url";

// Define static and dynamic routes
const noCheckRoutes = new Set([
  "/login",
  "/forgot-password",
  "/reset-password",
]);
const dynamicRoutes = ["/preview/repo/:id"];

// Function to create a regex pattern for a dynamic route
const createDynamicRouteRegex = (pattern: string): RegExp => {
  const regexPattern = pattern.replace(/:[^\s/]+/g, "([\\w-]+)");
  return new RegExp(`^${regexPattern}$`);
};

// Precompile dynamic route patterns
const dynamicRoutePatterns = dynamicRoutes.map(createDynamicRouteRegex);

// Function to check if a route requires authentication
const requiresAuth = (currentRoute: string): boolean => {
  // Check static routes first (most common case)
  if (noCheckRoutes.has(currentRoute)) {
    return false;
  }

  // Check dynamic routes
  for (const pattern of dynamicRoutePatterns) {
    if (pattern.test(currentRoute)) {
      return false;
    }
  }

  // If not matched, it requires authentication
  return true;
};

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  { rel: "stylesheet", href: sonnerStyles },
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

export const loader: LoaderFunction = async ({ request }) => {
  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await cookieConsent.parse(cookieHeader)) || {};
  const url = new URL(request.url);
  const currentRoute = url.pathname;

  return json({
    checkUser: requiresAuth(currentRoute) ?? false,
    showBanner: !cookie.accepted,
    ENV: {
      BACKEND_URL: process.env.BACKEND_URL,
      APP_URL: process.env.APP_URL,
      STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
    },
  });
};

declare global {
  interface Window {
    ENV: {
      BACKEND_URL: string;
      APP_URL: string;
      STRIPE_PUBLISHABLE_KEY: string;
    };
  }
}

export const action: ActionFunction = async ({ request }) => {
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
  const data = useLoaderData<typeof loader>();
  const { checkLoginStatus } = useUserStore();

  useEffect(() => {
    if (data?.checkUser) {
      checkLoginStatus();
    }
  }, [data?.checkUser, checkLoginStatus]);

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
        />
        <ScrollRestoration />
        <ExternalScripts />
        {data?.showBanner && <CookieBanner />}
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <>
      <Outlet />
      <Toaster />
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
