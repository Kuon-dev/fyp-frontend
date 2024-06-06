import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { showErrorToast } from "@/lib/handle-error";
import { checkEmailSchema } from "@/lib/validations/auth";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/custom/spinner";
import { useNavigate } from "@remix-run/react";
// import { Icons } from "@/components/icons"

type Inputs = z.infer<typeof checkEmailSchema>;

export default function ForgotPasswordForm() {
  const nav = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const form = useForm<Inputs>({
    resolver: zodResolver(checkEmailSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: Inputs) {
    setLoading(true);

    try {
      // const firstFactor = await signIn.create({
      //   strategy: "reset_password_email_code",
      //   identifier: data.email,
      // })
      console.log("placeholder");

      // if (true) {
      //   nav("/reset-password")
      //   toast.message("Check your email", {
      //     description: "We sent you a 6-digit verification code.",
      //   })
      // }
    } catch (err) {
      showErrorToast(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="rodneymullen180@gmail.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="mt-2" disabled={loading}>
          {loading && <Spinner />}
          Continue
          <span className="sr-only">
            Continue to reset password verification
          </span>
        </Button>
      </form>
    </Form>
  );
}
