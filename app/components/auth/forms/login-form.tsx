import { HTMLAttributes, useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "@remix-run/react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/custom/button";
import { PasswordInput } from "@/components/custom/password-input";
import { cn } from "@/lib/utils";
import { showErrorToast } from "@/lib/handle-error";

interface UserAuthFormProps extends HTMLAttributes<HTMLDivElement> {}

type LoginErrorSchema = {
  data: {
    message: string; // Description of the error
    details?: string; // Optional detailed information about the error
    timestamp?: string; // Optional timestamp of when the error occurred
  };
  statusCode: number; // HTTP status code
  error: string; // Short error code or type
  stackTrace?: string; // Optional stack trace for debugging purposes
};

// handle form submission
const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Please enter your email" })
    .email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(1, {
      message: "Please enter your password",
    })
    .min(7, {
      message: "Password must be at least 7 characters long",
    }),
});

export default function LoginForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const nav = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      // e.preventDefault()
      setIsLoading(true);
      const res = await fetch(`${window.ENV?.BACKEND_URL}/api/v1/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      } else {
        // set cookie
        // const json = await res.json();

        toast.success("Login successful!");
        nav("/app");
        // redirect
      }
      setIsLoading(false);
    } catch (error) {
      showErrorToast(error);
      // if it is a type of error
      // else toast.error('something went wrong, please try again')
      setIsLoading(false);
    }
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <div className="flex items-center justify-between">
                    <FormLabel>Password</FormLabel>
                    <Link
                      to="/forgot-password"
                      className="text-sm font-medium text-muted-foreground hover:opacity-75"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <FormControl>
                    <PasswordInput placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="mt-2" loading={isLoading}>
              Login
            </Button>
            <p className="text-sm font-medium text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-sm font-medium text-muted-foreground hover:opacity-75"
              >
                <span className="underline underline-offset-4 hover:text-primary">
                  {" "}
                  Sign up now!
                </span>
              </Link>
            </p>
            <p className="text-sm font-medium text-muted-foreground">
              Or{" "}
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-muted-foreground hover:opacity-75"
              >
                <span className="underline underline-offset-4 hover:text-primary">
                  Forgot your password?{" "}
                </span>
              </Link>
            </p>
          </div>
        </form>
      </Form>
    </div>
  );
}
