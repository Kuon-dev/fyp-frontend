import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogContent } from "@/components/ui/alert-dialog";
import { useNavigate } from "@remix-run/react";
import { ClientOnly } from "remix-utils/client-only";
import React from "react";

export default function VerifyEmailComponent() {
  const nav = useNavigate();
  const [isResending, setIsResending] = React.useState(false);

  const handleResend = async () => {
    setIsResending(true);
  };

  return (
    <ClientOnly>
      {() => (
        <AlertDialog open={true}>
          <AlertDialogContent className="w-full">
            <div className="">
              <div className="">
                <h2 className="text-2xl font-bold text-center mb-4 dark:text-gray-200">
                  Verify Your Email Address
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  We've sent a verification link to your email address. Please
                  check your inbox and click on the link to verify your email.
                </p>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  If you didn't receive the email, please check your spam folder
                  or click the button below to resend the verification email.
                </p>
                <form method="post" action="/app" onSubmit={handleResend}>
                  <Button
                    className="w-full"
                    type="submit"
                    disabled={isResending}
                  >
                    Resend Verification Email
                  </Button>
                  <Button
                    type="button"
                    className="w-full mt-4"
                    variant="outline"
                    onClick={() => nav("/app")}
                  >
                    Refresh
                  </Button>
                </form>
              </div>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </ClientOnly>
  );
}
