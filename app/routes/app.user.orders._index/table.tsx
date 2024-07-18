import React, { useState } from "react";
import { z } from "zod";
import { ColumnDef, Row } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/custom/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import type { ZodSchema } from "zod";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { showErrorToast } from "@/lib/handle-error";
import { toast } from "sonner";

// Define the schema for the order
const orderSchema = z.object({
  id: z.string(),
  userId: z.string(),
  codeRepoId: z.string(),
  status: z.enum([
    "REQUIRESPAYMENTMETHOD",
    "REQUIRESCONFIRMATION",
    "REQUIRESACTION",
    "PROCESSING",
    "REQUIRESCAPTURE",
    "CANCELLED",
    "SUCCEEDED",
  ]),
  totalAmount: z.number(),
  stripePaymentIntentId: z.string().nullable(),
  stripePaymentMethodId: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
  user: z.object({
    email: z.string(),
  }),
  codeRepo: z.object({
    name: z.string(),
  }),
});

export type OrderSchema = z.infer<typeof orderSchema>;

// Status options for filter
export const statusOptions = [
  { label: "Requires Payment Method", value: "REQUIRESPAYMENTMETHOD" },
  { label: "Requires Confirmation", value: "REQUIRESCONFIRMATION" },
  { label: "Requires Action", value: "REQUIRESACTION" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Requires Capture", value: "REQUIRESCAPTURE" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Succeeded", value: "SUCCEEDED" },
];

interface DialogProps {
  order: OrderSchema;
  onClose: () => void;
  onAction: (action: string) => Promise<void>;
}

const ProcessOrderDialog: React.FC<DialogProps> = ({
  order,
  onClose,
  onAction,
}) => {
  const { user, codeRepo, totalAmount, status } = order;

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>Process Order</AlertDialogTitle>
        <AlertDialogDescription>
          Please review the following information before processing the order
          for ${totalAmount.toFixed(2)}.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <div className="my-4">
        <h3 className="font-semibold mb-2">Order Information:</h3>
        <p>User Email: {user.email}</p>
        <p>Code Repo: {codeRepo.name}</p>
        <p>Status: {status}</p>
        <p>Total Amount: ${totalAmount.toFixed(2)}</p>
      </div>
      <AlertDialogDescription className="mt-4 text-sm text-gray-500">
        Note: This action will update the order status. Please ensure all
        necessary checks have been performed.
      </AlertDialogDescription>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={() => onAction("approve")}>
          Approve Order
        </AlertDialogAction>
        <AlertDialogAction
          onClick={() => onAction("cancel")}
          className="bg-red-600 hover:bg-red-700"
        >
          Cancel Order
        </AlertDialogAction>
      </AlertDialogFooter>
    </>
  );
};

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  tableSchema: ZodSchema<OrderSchema>;
}

export function OrderTableRowActions<TData>({
  row,
  tableSchema,
}: DataTableRowActionsProps<TData>) {
  const order = tableSchema.parse(row.original);
  const [activeDialog, setActiveDialog] = useState<string | null>(null);

  const handleAction = async (action: string) => {
    try {
      const url = `${window.ENV.BACKEND_URL}/api/v1/orders/${order.id}`;
      const res = await fetch(url, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: action === "approve" ? "SUCCEEDED" : "CANCELLED",
        }),
      });

      if (!res.ok) {
        throw new Error("Oh no! Something went wrong!");
      }

      toast.success(
        `Order ${action === "approve" ? "approved" : "cancelled"} successfully`,
      );
      window.location.reload();
    } catch (e) {
      showErrorToast(e);
    }
  };

  const renderDialogContent = () => {
    switch (activeDialog) {
      case "process":
        return (
          <ProcessOrderDialog
            order={order}
            onClose={() => setActiveDialog(null)}
            onAction={handleAction}
          />
        );
      default:
        return null;
    }
  };

  return (
    <AlertDialog
      open={!!activeDialog}
      onOpenChange={() => setActiveDialog(null)}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <DotsHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem
            onClick={() => setActiveDialog("process")}
            disabled={
              order.status === "SUCCEEDED" || order.status === "CANCELLED"
            }
          >
            Process Order
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialogContent>{renderDialogContent()}</AlertDialogContent>
    </AlertDialog>
  );
}

export const columns: ColumnDef<OrderSchema>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "email",
    accessorKey: "user.email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User Email" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate">{row.original.user.email}</div>
    ),
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "codeRepo.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Code Repo" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate">{row.original.codeRepo.name}</div>
    ),
  },
  {
    accessorKey: "totalAmount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Amount" />
    ),
    cell: ({ row }) => (
      <div className="">${row.getValue<number>("totalAmount").toFixed(2)}</div>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => <div className="">{row.getValue("status")}</div>,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    cell: ({ row }) => (
      <div>{new Date(row.getValue<string>("createdAt")).toLocaleString()}</div>
    ),
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Updated At" />
    ),
    cell: ({ row }) => (
      <div>{new Date(row.getValue<string>("updatedAt")).toLocaleString()}</div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <OrderTableRowActions row={row} tableSchema={orderSchema} />
    ),
  },
];

// Export filters for use in the main component
export const filters = [
  {
    columnId: "status",
    title: "Status",
    options: statusOptions,
  },
];
