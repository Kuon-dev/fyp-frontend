import RegisterForm from "@/components/auth/forms/register-form";
import AuthLayout from "@/components/auth/layout";

export default function Login() {
  return (
    <AuthLayout>
      <HeaderTitle />
      <RegisterForm />
      <FooterQuote />
    </AuthLayout>
  );
}

function FooterQuote() {
  return (
    <p className="px-8 text-center text-sm text-muted-foreground mt-2">
      By clicking register, you agree to our{" "}
      <a
        href="/terms"
        className="underline underline-offset-4 hover:text-primary"
      >
        Terms of Service
      </a>{" "}
      and{" "}
      <a
        href="/privacy"
        className="underline underline-offset-4 hover:text-primary"
      >
        Privacy Policy
      </a>
      .
    </p>
  );
}

function HeaderTitle() {
  return (
    <div className="flex flex-col space-y-2 text-left">
      <h1 className="text-2xl font-semibold tracking-tight">Register</h1>
      <p className="text-sm text-muted-foreground">
        Enter your email and password to create your account
      </p>
    </div>
  );
}
