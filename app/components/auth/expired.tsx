/**
 * v0 by Vercel.
 * @see https://v0.dev/t/ofxfcFSyMU1
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Link } from "@remix-run/react";

export default function Component() {
  return (
    <AlertDialog defaultOpen>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Oops, something went wrong!</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription className="text-muted-foreground">
          An unexpected error has occurred. Please try again or go to the login
          page.
        </AlertDialogDescription>
        <AlertDialogFooter>
          <Button
            onClick={() => window.location.reload()}
            className="bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Refresh Page
          </Button>
          <Link
            to="/login"
            className="inline-flex items-center rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground shadow-sm transition-colors hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
          >
            Go to Login
          </Link>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
