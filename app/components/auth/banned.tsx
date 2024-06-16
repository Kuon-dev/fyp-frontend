import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogContent } from "@/components/ui/alert-dialog";
import { useNavigate } from "@remix-run/react";
import { ClientOnly } from "remix-utils/client-only";

export default function BannedBanner() {
  const nav = useNavigate();
  return (
    <ClientOnly>
      {() => (
        <AlertDialog open={true}>
          <AlertDialogContent className="w-full">
            <div className="">
              <div className="">
                <h2 className="text-2xl font-bold text-center mb-4 dark:text-gray-200">
                  Your account has been banned
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Please contact support for more information.
                </p>
                <Button
                  className="w-full mt-4"
                  variant="outline"
                  onClick={() => nav("/support/ticket")}
                >
                  Submit a ticket
                </Button>
              </div>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </ClientOnly>
  );
}
