import LoginForm from "@/components/auth/forms/login-form";
import AuthLayout from "@/components/auth/layout";

export default function Login() {
  return (
    <AuthLayout>
      <HeaderTitle />
      <LoginForm />
    </AuthLayout>
  );
}

function HeaderTitle() {
  return (
    <div className="flex flex-col space-y-2 text-left">
      <h1 className="text-2xl font-semibold tracking-tight">Login</h1>
      <p className="text-sm text-muted-foreground">
        Enter your email and password to access your account
      </p>
    </div>
  );
}
