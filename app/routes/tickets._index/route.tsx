import React, { useEffect } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { columns, statuses } from "./table-schema";
import { ClientOnly } from "remix-utils/client-only";
import { LoaderFunction, json } from "@remix-run/node";
import {
  Outlet,
  useLoaderData,
  useNavigate,
  useOutlet,
  useRouteError,
} from "@remix-run/react";
import {} from // Dialog,
// DialogContent,
// DialogDescription,
// DialogFooter,
// DialogHeader,
// DialogTitle,
// DialogTrigger,
"@/components/ui/dialog";

// import { Clie}
export const ErrorBoundary = () => {
  const error = useRouteError();
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <h1 className="text-3xl font-semibold mb-4">
          Oh no! Something went wrong!
        </h1>
        <p className="text-lg text-gray-600">
          We're sorry! It looks like something went wrong. Please try again
          later.
        </p>
      </div>
    </div>
  );
};

export const loader: LoaderFunction = async () => {
  const data = await fetch(
    `${process.env.BACKEND_URL}/api/v1/tickets/all`,
  ).then((res) => res.json());
  if (data.status !== "success")
    throw new Error("Oh no! Something went wrong!");
  return json({
    items: data,
    sucess: data.ok,
  });
};

const filters = [
  {
    columnId: "status",
    title: "Status",
    options: statuses,
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

export default function TicketIndex() {
  const tickets = useLoaderData<typeof loader>();

  return (
    <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
      <ClientOnly fallback={<div>Loading...</div>}>
        {() => (
          <>
            <DataTable
              data={tickets.items.data ?? []}
              columns={columns}
              filters={filters}
            />
          </>
        )}
      </ClientOnly>
    </div>
  );
}
