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
import { ContextMenuContent } from "@/components/ui/context-menu";
import { showErrorToast } from "@/lib/handle-error";
import { toast } from "sonner";

// Review schema
export const reviewSchema = z.object({
  id: z.string(),
  content: z.string(),
  userId: z.string(),
  flag: z.string(),
  upvotes: z.number(),
  downvotes: z.number(),
});

export type ReviewSchema = z.infer<typeof reviewSchema>;

// Flag options for filter
export const flagOptions = [
  { label: "No Flag", value: "NONE" },
  { label: "Spam", value: "SPAM" },
  { label: "Inappropriate Language", value: "INAPPROPRIATE_LANGUAGE" },
  { label: "Harassment", value: "HARASSMENT" },
  { label: "Off-topic", value: "OFF_TOPIC" },
  { label: "False Information", value: "FALSE_INFORMATION" },
  { label: "Plagiarism", value: "PLAGIARISM" },
  { label: "Other", value: "OTHER" },
];

// Vote count options for filter
export const voteCountOptions = [
  { label: "Low (0-10)", value: "low" },
  { label: "Medium (11-50)", value: "medium" },
  { label: "High (>50)", value: "high" },
];

interface DialogProps {
  review: ReviewSchema;
  onClose: () => void;
  onAction: () => Promise<void>;
}

const RemoveFlagDialog: React.FC<DialogProps> = ({
  review,
  onClose,
  onAction,
}) => (
  <>
    <AlertDialogHeader>
      <AlertDialogTitle>Remove Flag</AlertDialogTitle>
      <AlertDialogDescription>
        Are you sure you want to remove the flag from this review? This action
        will mark the review as reviewed.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={onAction}>Remove Flag</AlertDialogAction>
    </AlertDialogFooter>
  </>
);

const DeleteReviewDialog: React.FC<DialogProps> = ({
  review,
  onClose,
  onAction,
}) => (
  <>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete Review</AlertDialogTitle>
      <AlertDialogDescription>
        Are you sure you want to delete this review? This action cannot be
        undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={onAction}>Delete Review</AlertDialogAction>
    </AlertDialogFooter>
  </>
);

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  tableSchema: ZodSchema<ReviewSchema>;
}

export function ReviewTableRowActions<TData>({
  row,
  tableSchema,
}: DataTableRowActionsProps<TData>) {
  const review = tableSchema.parse(row.original);
  const [activeDialog, setActiveDialog] = React.useState<string | null>(null);

  const handleAction = async (action: string) => {
    try {
      // eslint-disable-next-line
      let url = `${window.ENV.BACKEND_URL}/api/v1/reviews/${review.id}`;
      let method = "PUT";

      switch (action) {
        case "removeFlag":
          url += "/revert";
          method = "PUT";
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(action === "removeFlag" ? { flag: "NONE" } : {}),
      });

      if (!res.ok) {
        throw new Error("Oh no! Something went wrong!");
      }

      toast.success(
        `Review ${action === "removeFlag" ? "updated" : "deleted"} successfully`,
      );
      window.location.reload();
    } catch (e) {
      showErrorToast(e);
    }
  };

  const renderDialogContent = () => {
    switch (activeDialog) {
      case "removeFlag":
        return (
          <RemoveFlagDialog
            review={review}
            onClose={() => setActiveDialog(null)}
            onAction={() => handleAction("removeFlag")}
          />
        );
      case "delete":
        return (
          <DeleteReviewDialog
            review={review}
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
          <DropdownMenuItem onClick={() => setActiveDialog("removeFlag")}>
            Remove Flag
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setActiveDialog("delete")}
            className="text-red-500"
          >
            Delete Review
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialogContent>{renderDialogContent()}</AlertDialogContent>
    </AlertDialog>
  );
}

export const toolbar = {};

export const columns: ColumnDef<ReviewSchema>[] = [
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
    accessorKey: "user",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User Email" />
    ),
    cell: ({ row }) => (
      <div className="w-[80px] max-w-[80px]">
        {(row.getValue("user") as BackendUser).email}
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "content",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Content" />
    ),
    cell: ({ row }) => {
      const content: string = row.getValue("content");
      return (
        <div className="max-w-[300px] truncate" title={content}>
          {content}
        </div>
      );
    },
  },
  {
    accessorKey: "upvotes",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Upvotes" />
    ),
    cell: ({ row }) => {
      const upvotes: number = row.getValue("upvotes");
      return <div className="text-green-500">{upvotes}</div>;
    },
  },
  {
    accessorKey: "downvotes",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Downvotes" />
    ),
    cell: ({ row }) => {
      const downvotes: number = row.getValue("downvotes");
      return <div className="text-red-500">{downvotes}</div>;
    },
  },
  {
    accessorKey: "flag",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Flag" />
    ),
    cell: ({ row }) => {
      const flagValue: number = row.getValue("flag");
      return (
        <div className="">
          {flagOptions.find((option) => option.value === flagValue.toString())
            ?.label || flagValue}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes((row.getValue(id) as string).toString());
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <ReviewTableRowActions row={row} tableSchema={reviewSchema} />
    ),
  },
];

// Export filters for use in the main component
export const filters = [
  {
    columnId: "flag",
    title: "Flag",
    options: flagOptions,
  },
  {
    columnId: "upvotes",
    title: "Upvotes",
    options: voteCountOptions,
  },
  {
    columnId: "downvotes",
    title: "Downvotes",
    options: voteCountOptions,
  },
];
