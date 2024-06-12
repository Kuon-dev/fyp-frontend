import { toast } from "sonner";
import { z } from "zod";

const backendURL =
  typeof window !== "undefined"
    ? window.ENV.BACKEND_URL
    : process.env.BACKEND_URL;

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
  type: z.string().min(1, "Type is required").max(255),
  message: z
    .string()
    .min(1, "Message is required")
    .max(10000, "Message is too long"),
});

const unknownError = "An unknown error occurred";

export function getErrorMessage(err: unknown) {
  if (err instanceof z.ZodError) {
    return err.errors[0]?.message ?? unknownError;
  } else if (err instanceof Error) {
    return err.message;
  } else {
    return unknownError;
  }
}

export function showErrorToast(err: unknown) {
  const errorMessage = getErrorMessage(err);
  console.log({ errorMessage });

  return toast.error(errorMessage);
}

/**
 * Create a new support ticket.
 *
 * @param data - The ticket data.
 */
export const createTicket = async (data: TicketData) => {
  try {
    const response = await fetch(`${backendURL}/api/v1/support/ticket`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

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
};

/**
 * Fetch ticket data by ID.
 *
 * @param ticketId - The ID of the ticket.
 * @returns The ticket data or null if failed.
 */
export const fetchTicketData = async (
  ticketId: string,
): Promise<z.infer<typeof EditTicketSchema> | null> => {
  try {
    const response = await fetch(
      `${backendURL}/api/v1/support/ticket/${ticketId}`,
    );
    const data = await response.json();
    if (response.ok) {
      return data as z.infer<typeof EditTicketSchema>;
    } else {
      throw new Error(data.message);
    }
  } catch (error: unknown) {
    showErrorToast(error);
    return null;
  }
};

/**
 * Update the status of a support ticket.
 *
 * @param ticketId - The ID of the ticket.
 * @param data - The updated ticket status.
 */
export const updateTicketStatus = async (
  ticketId: string,
  data: z.infer<typeof EditTicketSchema>,
) => {
  try {
    const response = await fetch(
      `${backendURL}/api/v1/support/ticket/${ticketId}`,
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
    toast.success("Ticket status has been updated successfully.");
  } catch (error: unknown) {
    showErrorToast(error);
  }
};

/**
 * Fetch all support tickets.
 */
export const fetchAllTickets = async (): Promise<
  z.infer<typeof NewTicketSchema>[] | null
> => {
  try {
    const response = await fetch(`${backendURL}/api/v1/support/tickets`);
    const data = await response.json();
    if (response.ok) {
      return data as z.infer<typeof NewTicketSchema>[];
    } else {
      throw new Error(data.message);
    }
  } catch (error: unknown) {
    showErrorToast(error);
    return null;
  }
};

/**
 * Fetch paginated support tickets.
 *
 * @param page - The page number for pagination.
 * @param limit - The number of tickets per page.
 */
export const fetchPaginatedTickets = async (
  page: number = 1,
  limit: number = 10,
): Promise<z.infer<typeof NewTicketSchema>[] | null> => {
  try {
    const response = await fetch(
      `${backendURL}/api/v1/support/tickets/paginated?page=${page}&limit=${limit}`,
    );
    const data = await response.json();
    if (response.ok) {
      return data as z.infer<typeof NewTicketSchema>[];
    } else {
      throw new Error(data.message);
    }
  } catch (error: unknown) {
    showErrorToast(error);
    return null;
  }
};

/**
 * Fetch support tickets by title.
 *
 * @param title - The title of the support tickets.
 */
export const fetchTicketsByTitle = async (
  title: string,
): Promise<z.infer<typeof NewTicketSchema>[] | null> => {
  try {
    const response = await fetch(
      `${backendURL}/api/v1/support/tickets/title?title=${title}`,
    );
    const data = await response.json();
    if (response.ok) {
      return data as z.infer<typeof NewTicketSchema>[];
    } else {
      throw new Error(data.message);
    }
  } catch (error: unknown) {
    showErrorToast(error);
    return null;
  }
};

/**
 * Fetch support tickets by email.
 *
 * @param email - The email address of the user.
 */
export const fetchTicketsByEmail = async (
  email: string,
): Promise<z.infer<typeof NewTicketSchema>[] | null> => {
  try {
    const response = await fetch(
      `${backendURL}/api/v1/support/tickets/email?email=${email}`,
    );
    const data = await response.json();
    if (response.ok) {
      return data as z.infer<typeof NewTicketSchema>[];
    } else {
      throw new Error(data.message);
    }
  } catch (error: unknown) {
    showErrorToast(error);
    return null;
  }
};

/**
 * Fetch support tickets by status.
 *
 * @param status - The status of the support tickets.
 */
export const fetchTicketsByStatus = async (
  status: string,
): Promise<z.infer<typeof NewTicketSchema>[] | null> => {
  try {
    const response = await fetch(
      `${backendURL}/api/v1/support/tickets/status?status=${status}`,
    );
    const data = await response.json();
    if (response.ok) {
      return data as z.infer<typeof NewTicketSchema>[];
    } else {
      throw new Error(data.message);
    }
  } catch (error: unknown) {
    showErrorToast(error);
    return null;
  }
};
