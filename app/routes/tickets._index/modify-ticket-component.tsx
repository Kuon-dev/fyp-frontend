import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Spinner } from "@/components/custom/spinner";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ClientOnly } from "remix-utils/client-only";
import {
  EditTicketSchema,
  fetchTicketData,
  updateTicketStatus,
} from "@/lib/fetcher/support";

type SupportFormData = z.infer<typeof EditTicketSchema>;

export function SupportCard({ ticketId }: { ticketId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [initialData, setInitialData] = useState<SupportFormData | null>(null);

  const form = useForm<SupportFormData>({
    resolver: zodResolver(EditTicketSchema),
    defaultValues: {
      status: initialData?.status || "todo",
    },
  });

  useEffect(() => {
    const ticketData = async () => {
      const data = await fetchTicketData(ticketId);
      setInitialData(data);
    };
    ticketData();
  }, [ticketId, form]);

  const onSubmit = async (data: SupportFormData) => {
    await updateTicketStatus(ticketId, data, setIsLoading);
  };

  return (
    <ClientOnly>
      {() => (
        <div className="mx-auto max-w-3xl py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <div className="text-center">
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
              Edit Ticket Status
            </h1>
          </div>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
            Update the status of your support ticket below.
          </p>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 mt-8"
            >
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="todo">Open</SelectItem>
                        <SelectItem value="inProgress">In Progress</SelectItem>
                        <SelectItem value="backlog">In Progress</SelectItem>
                        <SelectItem value="done">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Spinner /> : "Update Status"}
              </Button>
            </form>
          </Form>
        </div>
      )}
    </ClientOnly>
  );
}

export default function Index() {
  const ticketId = "your_ticket_id"; // Replace with the actual ticket ID
  return (
    <>
      <SupportCard ticketId={ticketId} />
    </>
  );
}
