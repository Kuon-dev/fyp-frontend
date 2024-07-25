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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { showErrorToast } from "@/lib/handle-error";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

// Define the schema for the support ticket
export const supportTicketSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  title: z.string(),
  content: z.string(),
  status: z.enum(["inProgress", "todo", "backlog", "done"]),
  type: z.enum(["general", "technical", "payment"]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type SupportTicketSchema = z.infer<typeof supportTicketSchema>;

// Status options for filter
export const statusOptions = [
  { label: "In Progress", value: "inProgress" },
  { label: "To Do", value: "todo" },
  { label: "Backlog", value: "backlog" },
  { label: "Done", value: "done" },
];

// Type options for filter
export const typeOptions = [
  { label: "General", value: "general" },
  { label: "Technical", value: "technical" },
  { label: "Payment", value: "payment" },
];

interface DialogProps {
  supportTicket: SupportTicketSchema;
  onClose: () => void;
  onAction: (action: string) => Promise<void>;
}

const UpdateSupportTicketDialog: React.FC<DialogProps> = ({
  supportTicket,
  onClose,
  onAction,
}) => {
  const [selectedStatus, setSelectedStatus] = useState(supportTicket.status);

  const statusOptions = [
    { label: "In Progress", value: "inProgress" },
    { label: "To Do", value: "todo" },
    { label: "Backlog", value: "backlog" },
    { label: "Done", value: "done" },
  ];

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
  };

  const handleSubmit = () => {
    onAction(selectedStatus);
  };
  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>Update Support Ticket</AlertDialogTitle>
        <AlertDialogDescription>
          Please review the following information before updating the support
          ticket.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right">Title:</Label>
          <span className="col-span-3">{supportTicket.title}</span>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right">Email:</Label>
          <span className="col-span-3">{supportTicket.email}</span>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right">Type:</Label>
          <span className="col-span-3">{supportTicket.type}</span>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right">Status:</Label>
          <Select
            onValueChange={handleStatusChange}
            defaultValue={supportTicket.status}
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-4 items-start gap-4">
          <Label className="text-right">Content:</Label>
          <ScrollArea className="col-span-3 h-[100px] w-full rounded-md border p-2">
            <p>{supportTicket.content}</p>
          </ScrollArea>
        </div>
      </div>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={handleSubmit}>
          Update Status
        </AlertDialogAction>
      </AlertDialogFooter>
    </>
  );
};

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  tableSchema: ZodSchema<SupportTicketSchema>;
}

export function SupportTicketTableRowActions<TData>({
  row,
  tableSchema,
}: DataTableRowActionsProps<TData>) {
  const supportTicket = tableSchema.parse(row.original);
  const [activeDialog, setActiveDialog] = useState<string | null>(null);

  const handleAction = async (status: string) => {
    try {
      const url = `${window.ENV.BACKEND_URL}/api/v1/support/ticket/${supportTicket.id}`;
      const res = await fetch(url, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        throw new Error("Oh no! Something went wrong!");
      }

      toast.success(`Support ticket updated successfully`);
      window.location.reload();
    } catch (e) {
      showErrorToast(e);
    }
  };

  const renderDialogContent = () => {
    switch (activeDialog) {
      case "update":
        return (
          <UpdateSupportTicketDialog
            supportTicket={supportTicket}
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
          <DropdownMenuItem onClick={() => setActiveDialog("update")}>
            Update Status
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialogContent>{renderDialogContent()}</AlertDialogContent>
    </AlertDialog>
  );
}

export const columns: ColumnDef<SupportTicketSchema>[] = [
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
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User Email" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate">{row.getValue("email")}</div>
    ),
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => <div className="">{row.getValue("title")}</div>,
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => <div className="">{row.getValue("type")}</div>,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
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
      <SupportTicketTableRowActions
        row={row}
        tableSchema={supportTicketSchema}
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
  {
    columnId: "type",
    title: "Type",
    options: typeOptions,
  },
];
