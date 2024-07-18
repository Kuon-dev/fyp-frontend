import React, { useEffect, useState } from "react";
import { useNavigate } from "@remix-run/react";
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useCheckoutStore } from "@/stores/checkout-store";
import { showErrorToast } from "@/lib/handle-error";
import CheckoutForm from "@/components/checkout/payment-form";

const stripePromise = loadStripe(
  "pk_test_51LAOCDBwwJRw41A69eBWMyPF0Vy1bWWJDmy3hjIRklMx8sgoJTw2NOi1Xp2yYnw68vxNhTmPZTklYaQ3DayxUnDI00yHqEAwld",
);

export default function Checkout() {
  const navigate = useNavigate();
  const {
    clientSecret,
    isLoading,
    error,
    repoId,
    initializeCheckout,
    setError,
  } = useCheckoutStore();
  const [isRecovering, setIsRecovering] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !stripePromise) {
      console.log("Attempting to load Stripe...");
      if (!window.ENV || !window.ENV.STRIPE_PUBLISHABLE_KEY) {
        console.error("Stripe publishable key is not set in window.ENV");
        setError("Stripe configuration is missing");
        return;
      }
    }
  }, [setError]);

  useEffect(() => {
    if (repoId && !clientSecret) {
      initializeCheckout(repoId).catch((err) => {
        showErrorToast(err);
        setError("Failed to initialize checkout. Please try again.");
      });
    }
  }, [repoId, clientSecret, initializeCheckout, setError]);

  useEffect(() => {
    if (clientSecret) {
      checkPaymentIntentStatus(clientSecret);
    }
  }, [clientSecret]);

  const checkPaymentIntentStatus = async (clientSecret: string) => {
    try {
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Stripe failed to load");
      }

      const { paymentIntent } =
        await stripe.retrievePaymentIntent(clientSecret);

      if (paymentIntent && paymentIntent.status === "succeeded") {
        setIsRecovering(true);
        await processPaymentOnServer(paymentIntent.id);
      }
    } catch (error) {
      console.error("Error checking payment intent status:", error);
      showErrorToast(error);
    }
  };

  const processPaymentOnServer = async (paymentIntentId: string) => {
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

      const result = await response.json();
      if (result.success) {
        toast.success("Payment Successful", {
          description: "Your payment has been processed successfully.",
        });
        navigate("/checkout/success", {
          replace: true,
          state: { orderId: result.orderId },
        });
      } else {
        throw new Error("Failed to process payment on the server.");
      }
    } catch (error) {
      console.error("Error processing payment on server:", error);
      showErrorToast(error);
      setIsRecovering(false);
    }
  };

  console.log("Render state:", {
    repoId,
    clientSecret,
    isLoading,
    error,
    isRecovering,
  });

  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto p-4">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Complete Your Purchase</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading payment information...</p>
          ) : isRecovering ? (
            <p>Recovering previous payment. Please wait...</p>
          ) : (
            clientSecret && (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm />
              </Elements>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}
