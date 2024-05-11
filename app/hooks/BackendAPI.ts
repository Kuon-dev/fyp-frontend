import { toast } from 'sonner'

export const handleError = (error: unknown) => {
  if (error instanceof Error) {
    console.error(error);
  }

  // let errorCode: number | undefined;
  let errorMessage = "Please try again."; // Default error message

  if (typeof error === "object" && error !== null && "response" in error) {
    const { response } = error as {
      response?: {
        status?: number;
        /* eslint-disable @typescript-eslint/no-explicit-any */
        data?: { errors?: Record<string, any>; message?: string };
      };
    };
    const { data } = response || {};
    // errorCode = status;

    const { errors, message } = data || {};

    if (errors) {
      errorMessage = Object.values(errors).flat().join(", ");
    } else if (message) {
      errorMessage = message;
    }
  }
  toast.error(`An error occurred. ${errorMessage}`);

  return null;
};
