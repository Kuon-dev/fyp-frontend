import { z } from "zod";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  AlertDialog,
  AlertDialogAction,
  // AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  // AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { ClientOnly } from "remix-utils/client-only";
import * as React from "react";
import { toast } from "sonner";
// import { useSubmit } from "@remix-run/react";
import { useNavigate } from "@remix-run/react";

const FormSchema = z.object({
  essential_cookie: z.boolean(),
  analytics_cookie: z.boolean().default(false),
});

export default function CookieBanner({ open }: { open: boolean }) {
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      essential_cookie: true,
      analytics_cookie: false,
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log(data);
    const formData = new FormData();
    formData.append("essential", data.essential_cookie.toString());
    formData.append("analytics", data.analytics_cookie.toString());
    const res = await fetch("/", {
      method: "POST",
      body: formData,
    });
    // toast status
    if (res.ok) {
      toast.success("Cookie preferences saved");
      navigate("/");
    } else {
      toast.error("Failed to save cookie preferences");
    }
  }

  return (
    <ClientOnly>
      {() => (
        <AlertDialog open={open}>
          <AlertDialogContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full space-y-6"
              >
                <AlertDialogHeader className="">
                  <div className="flex items-center">
                    <CookieIcon className="mr-2" />
                    <AlertDialogTitle>Cookie Preferences</AlertDialogTitle>
                  </div>
                  <AlertDialogDescription>
                    Manage your cookie settings. You can enable or disable
                    different types of cookies below.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="essential_cookie"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Essential Cookies
                          </FormLabel>
                          <FormDescription>
                            These cookies are necessary for the website to
                            function and cannot be switched off.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="analytics_cookie"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Analytics Cookies
                          </FormLabel>
                          <FormDescription>
                            These cookies allow us to count visits and traffic
                            sources, so we can measure and improve the
                            performance of our site.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="border-t border-dark-gray-300 mt-4" />
                <AlertDialogFooter>
                  <AlertDialogAction className="ml-auto" asChild>
                    <Button type="submit"> Save Preferences </Button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </form>
            </Form>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </ClientOnly>
  );
}

function CookieIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
      <path d="M8.5 8.5v.01" />
      <path d="M16 15.5v.01" />
      <path d="M12 12v.01" />
      <path d="M11 17v.01" />
      <path d="M7 14v.01" />
    </svg>
  );
}
