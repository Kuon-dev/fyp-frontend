import { z } from "zod";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";

// Define the schema for the seller's payout request
export const sellerPayoutRequestSchema = z.object({
  id: z.string(),
  totalAmount: z.number(),
  status: z.enum(["PENDING", "REJECTED", "PROCESSED"]),
  createdAt: z.string(),
  updatedAt: z.string(),
  processedAt: z.string().nullable(),
});

export type SellerPayoutRequestSchema = z.infer<
  typeof sellerPayoutRequestSchema
>;

// Status options for filter
export const statusOptions = [
  { label: "Pending", value: "PENDING" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Processed", value: "PROCESSED" },
];

// Define the columns for the seller's payout request table
export const columns: ColumnDef<SellerPayoutRequestSchema>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Request ID" />
    ),
    cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "totalAmount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Amount" />
    ),
    cell: ({ row }) => (
      <div className="">
        RM {row.getValue<number>("totalAmount").toFixed(2)}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => <div>{row.getValue("status")}</div>,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Requested At" />
    ),
    cell: ({ row }) => (
      <div>{new Date(row.getValue<string>("createdAt")).toLocaleString()}</div>
    ),
  },
  {
    accessorKey: "processedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Processed At" />
    ),
    cell: ({ row }) => {
      const processedAt = row.getValue<string | null>("processedAt");
      return processedAt ? (
        <div>{new Date(processedAt).toLocaleString()}</div>
      ) : (
        <div>Not processed</div>
      );
    },
  },
];

// Define the filters for the table
export const filters = [
  {
    columnId: "status",
    title: "Status",
    options: statusOptions,
  },
];
