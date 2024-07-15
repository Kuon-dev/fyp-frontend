import { z } from "zod";
import { ColumnDef, Row } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/custom/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DotsHorizontalIcon, FileIcon } from "@radix-ui/react-icons";
//import type { ZodSchema } from "zod";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { showErrorToast } from "@/lib/handle-error";
import { toast } from "sonner";
import { Link } from "@remix-run/react";
import React from "react";

// User schema
const bankAccountSchema = z.object({
  id: z.string(),
  sellerProfileId: z.string(),
  accountHolderName: z.string(),
  accountNumber: z.string(),
  bankName: z.string(),
  swiftCode: z.string(),
  iban: z.string().nullable(),
  routingNumber: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Define the user schema with the updated sellerProfile including bankAccount
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  bannedUntil: z.string().nullable(),
  role: z.enum(["ADMIN", "USER", "SELLER", "MODERATOR"]),
  sellerProfile: z
    .object({
      id: z.string(),
      userId: z.string(),
      profileImg: z.string().nullable(),
      businessName: z.string(),
      businessAddress: z.string(),
      businessPhone: z.string(),
      businessEmail: z.string(),
      identityDoc: z.string().nullable(),
      verificationDate: z.string().nullable(),
      verificationStatus: z.enum(["PENDING", "APPROVED", "REJECTED", "IDLE"]),
      balance: z.number().nullable(),
      lastPayoutDate: z.string().nullable(),
      bankAccount: bankAccountSchema.nullable(),
    })
    .nullable(),
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
type SellerProfileType = NonNullable<UserSchema["sellerProfile"]>;
type VerificationStatusType = SellerProfileType["verificationStatus"];
//type VerificationStatus = UserSchema["sellerProfile"][];

interface DialogProps {
  user: UserSchema;
  onClose: () => void;
  onAction: (
    action: "ban" | "unban" | "delete" | "reviewApplication",
    status?: string,
  ) => Promise<void>;
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
      <AlertDialogAction onClick={() => onAction("ban")}>
        Ban User
      </AlertDialogAction>
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
      <AlertDialogAction onClick={() => onAction("unban")}>
        Unban User
      </AlertDialogAction>
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
      <AlertDialogAction onClick={() => onAction("delete")}>
        Delete User
      </AlertDialogAction>
    </AlertDialogFooter>
  </>
);

const ReviewApplicationDialog: React.FC<DialogProps> = ({
  user,
  onClose,
  onAction,
}) => {
  const [status, setStatus] = React.useState<VerificationStatusType>(
    user.sellerProfile?.verificationStatus || "PENDING",
  );

  if (!user.sellerProfile) {
    return (
      <AlertDialogHeader>
        <AlertDialogTitle>Seller Profile Not Found</AlertDialogTitle>
        <AlertDialogDescription>
          This user does not have a seller profile.
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogHeader>
    );
  }

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>Review Seller Application</AlertDialogTitle>
        <AlertDialogDescription>
          Review and update the status of the seller application for{" "}
          {user.email}.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-medium">Business Profile</h3>
            <div className="mt-4 grid gap-4">
              <div className="grid grid-cols-2 items-center">
                <div className="text-muted-foreground">Company Name</div>
                <div>{user.sellerProfile.businessName}</div>
              </div>
              <div className="grid grid-cols-2 items-center">
                <div className="text-muted-foreground">Business Address</div>
                <div>{user.sellerProfile.businessAddress}</div>
              </div>
              <div className="grid grid-cols-2 items-center">
                <div className="text-muted-foreground">Business Phone</div>
                <div>{user.sellerProfile.businessPhone}</div>
              </div>
              <div className="grid grid-cols-2 items-center">
                <div className="text-muted-foreground">Business Email</div>
                <div>{user.sellerProfile.businessEmail}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-medium">Bank Account Details</h3>
            <div className="mt-4 grid gap-4">
              {user.sellerProfile.bankAccount ? (
                <>
                  <div className="grid grid-cols-2 items-center">
                    <div className="text-muted-foreground">
                      Account Holder Name
                    </div>
                    <div>
                      {user.sellerProfile.bankAccount.accountHolderName}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 items-center">
                    <div className="text-muted-foreground">Account Number</div>
                    <div>{user.sellerProfile.bankAccount.accountNumber}</div>
                  </div>
                  <div className="grid grid-cols-2 items-center">
                    <div className="text-muted-foreground">Bank Name</div>
                    <div>{user.sellerProfile.bankAccount.bankName}</div>
                  </div>
                  <div className="grid grid-cols-2 items-center">
                    <div className="text-muted-foreground">SWIFT Code</div>
                    <div>{user.sellerProfile.bankAccount.swiftCode}</div>
                  </div>
                  <div className="grid grid-cols-2 items-center">
                    <div className="text-muted-foreground">IBAN</div>
                    <div>{user.sellerProfile.bankAccount.iban || "N/A"}</div>
                  </div>
                  <div className="grid grid-cols-2 items-center">
                    <div className="text-muted-foreground">Routing Number</div>
                    <div>{user.sellerProfile.bankAccount.routingNumber}</div>
                  </div>
                </>
              ) : (
                <div className="text-muted-foreground">
                  No bank account details available
                </div>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-medium">Verification Status</h3>
            <div className="mt-4">
              <Select
                onValueChange={(e) => setStatus(e as VerificationStatusType)}
                defaultValue={status}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select application status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="IDLE" disabled>
                    Idle
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
        <Button onClick={() => onAction("reviewApplication", status)}>
          Update Status
        </Button>
      </AlertDialogFooter>
    </>
  );
};

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  tableSchema: z.ZodSchema<UserSchema>;
}

export function UserTableRowActions<TData>({
  row,
  tableSchema,
}: DataTableRowActionsProps<TData>) {
  const user = tableSchema.parse(row.original);
  const [activeDialog, setActiveDialog] = React.useState<string | null>(null);

  const handleAction = async (action: string, status?: string) => {
    try {
      let url = `${window.ENV.BACKEND_URL}/api/v1/admin/${user.email}`;
      let method = "POST";
      let body = null;

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
        case "reviewApplication":
          url = `${window.ENV.BACKEND_URL}/api/v1/admin/seller-profile/${user.email}`;
          method = "PUT";
          body = JSON.stringify({ verificationStatus: status });
          break;
        default:
          throw new Error("Invalid action");
      }

      const res = await fetch(url, {
        method: method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: body,
      });

      if (!res.ok) {
        throw new Error("Oh no! Something went wrong!");
      }

      toast.success(`Action ${action} completed successfully`);
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
      case "reviewApplication":
        return (
          <ReviewApplicationDialog
            user={user}
            onClose={() => setActiveDialog(null)}
            onAction={(action, status) => handleAction(action, status)}
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
            <>
              <Link to={`/app/admin/users/seller-profile/${user.email}`}>
                <DropdownMenuItem>Edit Seller Profile</DropdownMenuItem>
              </Link>
              <DropdownMenuItem
                onClick={() => setActiveDialog("reviewApplication")}
              >
                Review Application
              </DropdownMenuItem>
            </>
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

      <AlertDialogContent className="w-1/2 max-w-full">
        {renderDialogContent()}
      </AlertDialogContent>
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
