import ForgotPasswordForm from "@/components/auth/forms/forgot-password-form";
import AuthLayout from "@/components/auth/layout";

function HeaderTitle() {
  return (
    <div className="flex flex-col space-y-2 text-left">
      <h1 className="text-2xl font-semibold tracking-tight">Reset Password</h1>
      <p className="text-sm text-muted-foreground">
        Enter your email below to reset your password
      </p>
    </div>
  );
}

export default function Layout() {
  return (
    <AuthLayout>
      <HeaderTitle />
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
