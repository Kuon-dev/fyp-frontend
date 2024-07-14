import React from "react";
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

// PayoutRequest schema
export const payoutRequestSchema = z.object({
  id: z.string(),
  sellerId: z.string(),
  amount: z.number(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "PROCESSED"]),
  createdAt: z.string(),
  updatedAt: z.string(),
  processedAt: z.string().nullable(),
});

export type PayoutRequestSchema = z.infer<typeof payoutRequestSchema>;

// Status options for filter
export const statusOptions = [
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Processed", value: "PROCESSED" },
];

interface DialogProps {
  payoutRequest: PayoutRequestSchema;
  onClose: () => void;
  onAction: (action: string) => Promise<void>;
}

const ProcessPayoutRequestDialog: React.FC<DialogProps> = ({
  payoutRequest,
  onClose,
  onAction,
}) => (
  <>
    <AlertDialogHeader>
      <AlertDialogTitle>Process Payout Request</AlertDialogTitle>
      <AlertDialogDescription>
        Are you sure you want to process this payout request for $
        {payoutRequest.amount}?
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={() => onAction("approve")}>
        Approve
      </AlertDialogAction>
      <AlertDialogAction
        onClick={() => onAction("reject")}
        className="bg-red-600 hover:bg-red-700"
      >
        Reject
      </AlertDialogAction>
    </AlertDialogFooter>
  </>
);

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  tableSchema: ZodSchema<PayoutRequestSchema>;
}

export function PayoutRequestTableRowActions<TData>({
  row,
  tableSchema,
}: DataTableRowActionsProps<TData>) {
  const payoutRequest = tableSchema.parse(row.original);
  const [activeDialog, setActiveDialog] = React.useState<string | null>(null);

  const handleAction = async (action: string) => {
    try {
      const url = `${window.ENV.BACKEND_URL}/api/v1/payout-requests/${payoutRequest.id}/process`;
      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        throw new Error("Oh no! Something went wrong!");
      }

      toast.success(`Payout request ${action}ed successfully`);
      window.location.reload();
    } catch (e) {
      showErrorToast(e);
    }
  };

  const renderDialogContent = () => {
    switch (activeDialog) {
      case "process":
        return (
          <ProcessPayoutRequestDialog
            payoutRequest={payoutRequest}
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
          <DropdownMenuItem onClick={() => setActiveDialog("process")}>
            Process Request
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialogContent>{renderDialogContent()}</AlertDialogContent>
    </AlertDialog>
  );
}

export const columns: ColumnDef<PayoutRequestSchema>[] = [
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
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Request ID" />
    ),
    cell: ({ row }) => (
      <div className="w-[80px] max-w-[80px] truncate">{row.getValue("id")}</div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "sellerId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Seller ID" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[150px] truncate">{row.getValue("sellerId")}</div>
    ),
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Amount" />
    ),
    cell: ({ row }) => (
      <div className="text-right">
        ${row.getValue<number>("amount").toFixed(2)}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("status")}</div>
    ),
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
  {
    id: "actions",
    cell: ({ row }) => (
      <PayoutRequestTableRowActions
        row={row}
        tableSchema={payoutRequestSchema}
      />
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
