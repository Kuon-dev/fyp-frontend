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
import { useNavigate } from "@remix-run/react";

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

const ViewOrderDialog: React.FC<DialogProps> = ({
  order,
  onClose,
  onAction,
}) => {
  const { codeRepo, totalAmount, status, createdAt } = order;

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>Order Details</AlertDialogTitle>
        <AlertDialogDescription>
          View the details of your order.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <div className="my-4">
        <h3 className="font-semibold mb-2">Order Information:</h3>
        <p>Code Repository: {codeRepo.name}</p>
        <p>Total Amount: ${totalAmount.toFixed(2)}</p>
        <p>Status: {status}</p>
        <p>Order Date: {new Date(createdAt).toLocaleString()}</p>
      </div>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={onClose}>Close</AlertDialogCancel>
        {status === "REQUIRESPAYMENTMETHOD" && (
          <AlertDialogAction onClick={() => onAction("pay")}>
            Complete Payment
          </AlertDialogAction>
        )}
        {[
          "REQUIRESPAYMENTMETHOD",
          "REQUIRESCONFIRMATION",
          "REQUIRESACTION",
        ].includes(status) && (
          <AlertDialogAction
            onClick={() => onAction("cancel")}
            className="bg-red-600 hover:bg-red-700"
          >
            Cancel Order
          </AlertDialogAction>
        )}
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
  const nav = useNavigate();
  const [activeDialog, setActiveDialog] = useState<string | null>(null);

  const handleAction = async (action: string) => {
    try {
      /* eslint-disable */
      let url = `${window.ENV.BACKEND_URL}/api/v1/orders/${order.id}`;
      let method = "PUT";
      let body: { status?: string } = {};
      /* eslint-enable */

      if (action === "pay") {
        nav(`/checkout/${order.stripePaymentIntentId}`);
        // Redirect to payment page or open payment modal
        // This is a placeholder and should be replaced with actual payment logic
        toast.info("Redirecting to payment page...");
        return;
      } else if (action === "cancel") {
        body.status = "CANCELLED";
      }

      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error("Oh no! Something went wrong!");
      }

      toast.success(
        `Order ${action === "cancel" ? "cancelled" : "updated"} successfully`,
      );
      window.location.reload();
    } catch (e) {
      showErrorToast(e);
    }
  };

  const renderDialogContent = () => {
    switch (activeDialog) {
      case "view":
        return (
          <ViewOrderDialog
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
          <DropdownMenuItem onClick={() => setActiveDialog("view")}>
            View Order
          </DropdownMenuItem>
          {order.status === "REQUIRESACTION" && (
            <DropdownMenuItem onClick={() => handleAction("pay")}>
              Complete Payment
            </DropdownMenuItem>
          )}
          {["REQUIRESPAYMENTMETHOD", "REQUIRESCONFIRMATION"].includes(
            order.status,
          ) && (
            <DropdownMenuItem onClick={() => handleAction("cancel")}>
              Cancel Order
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialogContent>{renderDialogContent()}</AlertDialogContent>
    </AlertDialog>
  );
}

export const columns: ColumnDef<OrderSchema>[] = [
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
