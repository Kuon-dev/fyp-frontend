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
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { showErrorToast } from "@/lib/handle-error";
import { toast } from "sonner";

// User schema
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  role: z.enum(["ADMIN", "USER", "SELLER", "MODERATOR"]), // Adjust roles as needed
});

export const roleOptions = [
  {
    label: "Seller",
    value: "SELLER",
  },
  {
    label: "User",
    value: "USER",
  },
  {
    label: "Moderator",
    value: "MODERATOR",
  },
];

export type UserSchema = z.infer<typeof userSchema>;

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  tableSchema: ZodSchema<UserSchema>;
}

export function UserTableRowActions<TData>({
  row,
  tableSchema,
}: DataTableRowActionsProps<TData>) {
  const user = tableSchema.parse(row.original);

  const handleDelete = async () => {
    try {
      const res = await fetch(
        `${window.ENV.BACKEND_URL}/api/v1/users/${user.email}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (!res.ok) {
        throw new Error("Oh no! Something went wrong!");
      }
      // Handle success
      toast.success("User deleted successfully");
      window.location.reload();
    } catch (e) {
      showErrorToast(e);
    }
  };
  return (
    <AlertDialog>
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
          <DropdownMenuItem>View Profile</DropdownMenuItem>
          <DropdownMenuItem>Edit User</DropdownMenuItem>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem className="text-red-500">
              Delete User
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </DropdownMenu>
    </AlertDialog>
  );
}

export const toolbar = {};

export const columns: ColumnDef<UserSchema>[] = [
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
      <DataTableColumnHeader column={column} title="User ID" />
    ),
    cell: ({ row }) => (
      <div className="w-[80px] max-w-[80px] truncate">{row.getValue("id")}</div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span>{row.getValue("email")}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span>{row.getValue("role")}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <UserTableRowActions row={row} tableSchema={userSchema} />
    ),
  },
];
