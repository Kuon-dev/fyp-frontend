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
import { Link } from "@remix-run/react";
import React from "react";

// User schema
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  bannedUntil: z.string().nullable(),
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

interface DialogProps {
  user: UserSchema;
  onClose: () => void;
  onAction: () => Promise<void>;
}

const BanUserDialog: React.FC<DialogProps> = ({ user, onClose, onAction }) => (
  <>
    <AlertDialogHeader>
      <AlertDialogTitle>Ban User</AlertDialogTitle>
      <AlertDialogDescription>
        Are you sure you want to ban {user.email}? This action can be reversed
        later.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={onAction}>Ban User</AlertDialogAction>
    </AlertDialogFooter>
  </>
);

const UnbanUserDialog: React.FC<DialogProps> = ({
  user,
  onClose,
  onAction,
}) => (
  <>
    <AlertDialogHeader>
      <AlertDialogTitle>Unban User</AlertDialogTitle>
      <AlertDialogDescription>
        Are you sure you want to unban {user.email}? This will restore their
        access to the platform.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={onAction}>Unban User</AlertDialogAction>
    </AlertDialogFooter>
  </>
);

const DeleteUserDialog: React.FC<DialogProps> = ({
  user,
  onClose,
  onAction,
}) => (
  <>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete User</AlertDialogTitle>
      <AlertDialogDescription>
        Are you absolutely sure you want to delete {user.email}? This action
        cannot be undone. This will permanently delete the account and remove
        all user data completely.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={onAction}>Delete User</AlertDialogAction>
    </AlertDialogFooter>
  </>
);

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  tableSchema: ZodSchema<UserSchema>;
}

export function UserTableRowActions<TData>({
  row,
  tableSchema,
}: DataTableRowActionsProps<TData>) {
  const user = tableSchema.parse(row.original);
  const [activeDialog, setActiveDialog] = React.useState<string | null>(null);

  const handleAction = async (action: string) => {
    try {
      let url = `${window.ENV.BACKEND_URL}/api/v1/admin/${user.email}`;
      let method = "POST";

      switch (action) {
        case "ban":
          url += "/ban";
          break;
        case "unban":
          url += "/unban";
          break;
        case "delete":
          method = "DELETE";
          break;
        default:
          throw new Error("Invalid action");
      }

      const res = await fetch(url, {
        method: method,
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Oh no! Something went wrong!");
      }

      toast.success(`User ${action}ed successfully`);
      window.location.reload();
    } catch (e) {
      showErrorToast(e);
    }
  };

  const renderDialogContent = () => {
    switch (activeDialog) {
      case "ban":
        return (
          <BanUserDialog
            user={user}
            onClose={() => setActiveDialog(null)}
            onAction={() => handleAction("ban")}
          />
        );
      case "unban":
        return (
          <UnbanUserDialog
            user={user}
            onClose={() => setActiveDialog(null)}
            onAction={() => handleAction("unban")}
          />
        );
      case "delete":
        return (
          <DeleteUserDialog
            user={user}
            onClose={() => setActiveDialog(null)}
            onAction={() => handleAction("delete")}
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
          {!user.bannedUntil ? (
            <Link to={`/app/admin/users/user-profile/${user.email}`}>
              <DropdownMenuItem>Edit Profile</DropdownMenuItem>
            </Link>
          ) : (
            <DropdownMenuItem disabled>Edit Profile</DropdownMenuItem>
          )}
          {user.role === "SELLER" && (
            <Link to={`/app/admin/users/seller-profile/${user.email}`}>
              <DropdownMenuItem>Edit Seller Profile</DropdownMenuItem>
            </Link>
          )}
          {user.bannedUntil ? (
            <DropdownMenuItem onClick={() => setActiveDialog("unban")}>
              Unban User
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() => setActiveDialog("ban")}
              className="text-red-500"
            >
              Ban User
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={() => setActiveDialog("delete")}
            className="text-red-500"
          >
            Delete User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialogContent>{renderDialogContent()}</AlertDialogContent>
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
