import ResetPasswordForm from "@/components/auth/forms/reset-password-form";
import AuthLayout from "@/components/auth/layout";

export default function ResetPasswordPage() {
  return (
    <AuthLayout>
      <ResetPasswordForm />
    </AuthLayout>
  );
}

function HeaderTitle() {
  return (
    <div className="flex flex-col space-y-2 text-left">
      <h1 className="text-2xl font-semibold tracking-tight">Reset password</h1>
      <p className="text-sm text-muted-foreground">Enter your new password</p>
    </div>
  );
}
