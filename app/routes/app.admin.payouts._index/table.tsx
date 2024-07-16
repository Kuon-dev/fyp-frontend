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

// Define the schema for the bank account
const bankAccountSchema = z.object({
  accountHolderName: z.string(),
  accountNumber: z.string(),
  bankName: z.string(),
  swiftCode: z.string(),
  iban: z.string().nullable(),
  routingNumber: z.string().nullable(),
});

// Define the schema for the seller profile
const sellerProfileSchema = z.object({
  id: z.string(),
  businessName: z.string(),
  businessEmail: z.string(),
  businessPhone: z.string(),
  bankAccount: bankAccountSchema,
  user: z.object({
    email: z.string(),
    bannedUntil: z.string().nullable(),
  }),
});

// Updated PayoutRequest schema
export const payoutRequestSchema = z.object({
  id: z.string(),
  totalAmount: z.number(),
  status: z.enum(["PENDING", "REJECTED", "PROCESSED"]),
  createdAt: z.string(),
  updatedAt: z.string(),
  processedAt: z.string().nullable(),
  sellerProfile: sellerProfileSchema,
});

export type PayoutRequestSchema = z.infer<typeof payoutRequestSchema>;

// Status options for filter
export const statusOptions = [
  { label: "Pending", value: "PENDING" },
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
}) => {
  const { sellerProfile, totalAmount } = payoutRequest;
  const { bankAccount } = sellerProfile;

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>Process Payout Request</AlertDialogTitle>
        <AlertDialogDescription>
          Please review the following information before processing the payout
          request for ${totalAmount.toFixed(2)}.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <div className="my-4">
        <h3 className="font-semibold mb-2">Seller Information:</h3>
        <p>Business Name: {sellerProfile.businessName}</p>
        <p>Business Email: {sellerProfile.businessEmail}</p>
        <p>Business Phone: {sellerProfile.businessPhone}</p>
      </div>
      <div className="my-4">
        <h3 className="font-semibold mb-2">Bank Account Information:</h3>
        <p>Account Holder: {bankAccount.accountHolderName}</p>
        <p>Account Number: {bankAccount.accountNumber}</p>
        <p>Bank Name: {bankAccount.bankName}</p>
        <p>Swift Code: {bankAccount.swiftCode}</p>
        {bankAccount.iban && <p>IBAN: {bankAccount.iban}</p>}
        {bankAccount.routingNumber && (
          <p>Routing Number: {bankAccount.routingNumber}</p>
        )}
      </div>
      <AlertDialogDescription className="mt-4 text-sm text-gray-500">
        Note: This action will only initiate the payout process. The actual
        transfer of funds will be completed after this step.
      </AlertDialogDescription>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={() => onAction("approve")}>
          Approve and Process Payout
        </AlertDialogAction>
        <AlertDialogAction
          onClick={() => onAction("reject")}
          className="bg-red-600 hover:bg-red-700"
        >
          Reject Payout
        </AlertDialogAction>
      </AlertDialogFooter>
    </>
  );
};

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  tableSchema: ZodSchema<PayoutRequestSchema>;
}

export function PayoutRequestTableRowActions<TData>({
  row,
  tableSchema,
}: DataTableRowActionsProps<TData>) {
  const payoutRequest = tableSchema.parse(row.original);
  const [activeDialog, setActiveDialog] = useState<string | null>(null);

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
          <DropdownMenuItem
            onClick={() => setActiveDialog("process")}
            disabled={row.getValue("processedAt")}
          >
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
    id: "email",
    accessorKey: "sellerProfile.user.email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User Email" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate">
        {row.original.sellerProfile.user.email}
      </div>
    ),
    enableSorting: true,
    enableHiding: false,
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
    cell: ({ row }) => (
      <div className="">{row.getValue("status")}</div>
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
