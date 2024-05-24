import { DataTable } from "@/components/data-table/data-table";
import { tasks, columns, statuses } from "./table-schema";
import { ClientOnly } from "remix-utils/client-only";
// import { Clie}

export default function TicketIndex() {
  const filters = [
    {
      columnId: "status",
      title: "Status",
      options: statuses,
    },
    {
      columnId: "priority",
      title: "Priority",
      options: [
        { label: "High", value: "high" },
        { label: "Medium", value: "medium" },
        { label: "Low", value: "low" },
      ],
    },
    // Add more filters as needed
  ];

  return (
    <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
      <ClientOnly fallback={<div>Loading...</div>}>
        {() => <DataTable data={tasks} columns={columns} filters={filters} />}
      </ClientOnly>
    </div>
  );
}
