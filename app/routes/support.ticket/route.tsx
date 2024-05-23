import { Shell } from "@/components/landing/shell";
// import {
//   CardTitle,
//   CardDescription,
//   CardHeader,
//   CardContent,
//   CardFooter,
//   Card,
// } from "@/components/ui/card";
// import { Label } from "@/components/ui/label";
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
import Navbar from "@/elements/landing-navbar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { useState } from "react";
import { Spinner } from "@/components/custom/spinner";

const SupportFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  topic: z.string().min(1, "Topic is required"),
  message: z.string().min(1, "Message is required"),
});

type SupportFormData = z.infer<typeof SupportFormSchema>;

const mockSubmit = async (data: SupportFormData) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return true;
};

function SupportCard() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SupportFormData>({
    resolver: zodResolver(SupportFormSchema),
    defaultValues: {
      name: "",
      email: "",
      topic: "",
      message: "",
    },
  });

  const onSubmit = async (data: SupportFormData) => {
    setIsLoading(true);
    try {
      const response = await mockSubmit(data);
      if (response) {
        toast.success("Support request submitted");
        form.reset();
      }
    } catch (error) {
      toast.error("Failed to submit support request");
    } finally {
      setIsLoading(false);
    }
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
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a topic" />
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
