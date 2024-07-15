// import React, { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/data-table/data-table";
import { columns, roleOptions } from "./table";
import { ClientOnly } from "remix-utils/client-only";
import { LoaderFunction, json, redirect } from "@remix-run/node";
import { useLoaderData, useRouteError } from "@remix-run/react";
import ErrorComponent from "@/components/error/500";
import { checkAuthCookie } from "@/lib/router-guard";

// import { Clie}
export const ErrorBoundary = () => {
  const error = useRouteError();
  return <ErrorComponent />;
};

export const loader: LoaderFunction = async ({ request }) => {
  const cookieHeader = request.headers.get("Cookie");
  if (!checkAuthCookie(request)) return redirect("/login");

  const res = await fetch(`${process.env.BACKEND_URL}/api/v1/users/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Cookie: cookieHeader?.toString() ?? "",
    },
  });
  if (!res.ok) throw new Error("Oh no! Something went wrong!");

  const data = await res.json();
  console.log(data);
  return json({
    items: data,
    sucess: data.ok,
  });
};

const filters = [
  {
    columnId: "role",
    title: "Role",
    options: roleOptions,
  },
  // {
  //   columnId: "email",
  //   title: "Priority",
  //   options: [
  //     { label: "High", value: "high" },
  //     { label: "Medium", value: "medium" },
  //     { label: "Low", value: "low" },
  //   ],
  // },
];

export default function Index() {
  const tickets = useLoaderData<typeof loader>();

  return (
    <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
      <ClientOnly fallback={<LoadingComponent />}>
        {() => (
          <>
            <DataTable
              data={tickets.items ?? []}
              columns={columns}
              filters={filters}
              search="email"
            />
          </>
        )}
      </ClientOnly>
    </div>
  );
}

function LoadingComponent() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <p className="text-gray-500 dark:text-gray-400">
          Please wait while we are preparing the content
        </p>
        <div className="flex items-center space-x-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
