import { Shell } from "@/components/landing/shell";
import { Input } from "@/components/ui/input";
import {
  SelectValue,
  SelectTrigger,
  SelectItem,
  SelectContent,
  Select,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  // FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useState } from "react";
import { Spinner } from "@/components/custom/spinner";
import { NewTicketSchema, createTicket } from "@/lib/fetcher/support";
import { showErrorToast } from "@/lib/handle-error";
import { toast } from "sonner";

type SupportFormData = z.infer<typeof NewTicketSchema>;

function SupportCard() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SupportFormData>({
    resolver: zodResolver(NewTicketSchema),
    defaultValues: {
      name: "",
      title: "",
      email: "",
      type: "",
      message: "",
    },
  });

  const onSubmit = async (data: SupportFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${window.ENV.BACKEND_URL}/api/v1/support/ticket`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            name: data.name,
            title: data.title,
            email: data.email,
            type: data.type,
            content: data.message,
          }),
        },
      );

      const res = await response.json();
      if (!response.ok) {
        throw new Error(res.data.message);
      }
      toast.success(
        "Your ticket has been submitted. We'll get back to you shortly.",
      );
    } catch (error: unknown) {
      showErrorToast(error);
    }
    setIsLoading(false);
  };

  return (
    <Shell>
      <div className="mx-auto max-w-3xl py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="text-center">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
            Submit support ticket
          </h1>
        </div>
        <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
          Fill out the form below to get help from our support team.
        </p>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-8"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      id="name"
                      placeholder="Enter your name"
                      required
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      id="title"
                      placeholder="Enter your title"
                      required
                      type="text"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      id="email"
                      placeholder="Enter your email"
                      required
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ticket type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="payment">Payment</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea
                      id="message"
                      placeholder="Describe your issue"
                      required
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Spinner /> : "Submit"}
            </Button>
          </form>
        </Form>
      </div>
    </Shell>
  );
}

export default function Index() {
  return (
    <>
      <SupportCard />
    </>
  );
}
