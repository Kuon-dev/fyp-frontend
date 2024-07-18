import { showErrorToast } from "@/lib/handle-error";
import { useNavigate } from "@remix-run/react";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const CheckoutForm = () => {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [requiresRecovery, setRequiresRecovery] = useState(false);
  const [recoveryPaymentIntentId, setRecoveryPaymentIntentId] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (stripe && elements) {
      console.log("Stripe and elements are ready");
    }
  }, [stripe, elements]);

  const processPaymentOnServer = async (
    paymentIntentId: string,
  ): Promise<{ success: boolean; orderId?: string }> => {
    try {
      if (!window.ENV || !window.ENV.BACKEND_URL) {
        throw new Error("Backend URL is not configured");
      }

      const response = await fetch(
        `${window.ENV.BACKEND_URL}/api/v1/checkout/process-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ paymentIntentId }),
          credentials: "include",
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to process payment on server",
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error processing payment on server:", error);
      throw error;
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      toast.error("Stripe is not loaded yet.");
      return;
    }

    setIsProcessing(true);

    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {},
        redirect: "if_required",
      });

      console.log("Payment confirmation result:", result);

      if (result.error) {
        throw new Error(result.error.message);
      }

      if (result.paymentIntent && result.paymentIntent.status === "succeeded") {
        try {
          const processResult = await processPaymentOnServer(
            result.paymentIntent.id,
          );

          if (processResult.success) {
            toast.success("Payment Successful", {
              description: "Your payment has been processed successfully.",
            });
            navigate("/checkout/success", {
              replace: true,
              state: { orderId: processResult.orderId },
            });
          } else {
            throw new Error("Failed to process payment on the server.");
          }
        } catch (serverError) {
          console.error("Server processing failed:", serverError);
          setRequiresRecovery(true);
          setRecoveryPaymentIntentId(result.paymentIntent.id);
          toast.error(
            "Payment recorded but order processing failed. Please try recovery or contact support.",
            {
              duration: 10000,
            },
          );
        }
      } else {
        throw new Error("Payment was not successful.");
      }
    } catch (error) {
      showErrorToast(error);
      console.error("Payment error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRecovery = async () => {
    if (!recoveryPaymentIntentId) {
      toast.error("No payment to recover.");
      return;
    }

    setIsProcessing(true);
    try {
      const processResult = await processPaymentOnServer(
        recoveryPaymentIntentId,
      );

      if (processResult.success) {
        toast.success("Recovery Successful", {
          description: "Your order has been successfully processed.",
        });
        navigate("/checkout/success", {
          replace: true,
          state: { orderId: processResult.orderId },
        });
      } else {
        throw new Error("Failed to recover the order.");
      }
    } catch (error) {
      showErrorToast(error);
      console.error("Recovery error:", error);
      toast.error("Recovery failed. Please contact customer support.", {
        duration: 10000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {!requiresRecovery ? (
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="w-full mt-4"
        >
          {isProcessing ? "Processing..." : "Pay Now"}
        </Button>
      ) : (
        <div className="mt-4">
          <p className="text-red-500 mb-2">
            Payment recorded but order processing failed. Please try recovery or
            contact support.
          </p>
          <Button
            onClick={handleRecovery}
            disabled={isProcessing}
            className="w-full"
          >
            {isProcessing ? "Recovering..." : "Attempt Recovery"}
          </Button>
        </div>
      )}
    </form>
  );
};

export default CheckoutForm;
