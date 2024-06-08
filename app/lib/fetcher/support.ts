import { toast } from "sonner";
import { z } from "zod";

type TicketData = {
  name: string;
  email: string;
  title: string;
  message: string;
  type: string;
};

export const EditTicketSchema = z.object({
  status: z.string().min(1, "Status is required").max(255),
});

export const NewTicketSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  email: z.string().email("Invalid email").max(255),
  title: z.string().min(1, "Title is required").max(255),
  type: z.string().min(1, "type is required").max(255),
  message: z
    .string()
    .min(1, "Message is required")
    .max(10000, "Message is too long"),
});

export const createTicket = async (data: TicketData) => {
  try {
    const response = await fetch(
      `${window.ENV.BACKEND_URL}/api/v1/ticket/new`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );

    const res = await response.json();
    if (!response.ok) {
      throw new Error(res.data.message);
    }
    toast("Your ticket has been submitted. We'll get back to you shortly.");
  } catch (error) {
    console.log(error);
    toast(`An error occurred. ${error}`);
  }
};

export const fetchTicketData = async (
  ticketId: string,
): Promise<z.infer<typeof EditTicketSchema> | null> => {
  try {
    const response = await fetch(
      `${window.ENV.BACKEND_URL}/api/v1/ticket/${ticketId}`,
    );
    const data = await response.json();
    if (response.ok) {
      return data as z.infer<typeof EditTicketSchema>;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error(error);
    toast(`Failed to fetch ticket data. ${error}`);
    return null;
  }
};

export const updateTicketStatus = async (
  ticketId: string,
  data: z.infer<typeof EditTicketSchema>,
  setIsLoading: (isLoading: boolean) => void,
) => {
  setIsLoading(true);
  try {
    const response = await fetch(
      `${window.ENV.BACKEND_URL}/api/v1/ticket/${ticketId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: data.status }),
      },
    );

    const res = await response.json();
    if (!response.ok) {
      throw new Error(res.data.message);
    }
    toast("Ticket status has been updated successfully.");
  } catch (error) {
    console.log(error);
    toast(`An error occurred. ${error}`);
  } finally {
    setIsLoading(false);
  }
};
