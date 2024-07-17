import React, { useState } from "react";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { loadStripe, Stripe, StripeElementsOptions } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { toast } from "sonner";

let stripePromise: Promise<Stripe | null>;
const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(window.ENV.STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { repoId } = params;

  const response = await fetch(`${process.env.API_URL}/api/v1/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ repoId }),
  });

  if (!response.ok) {
    throw new Error("Failed to create payment intent");
  }

  const { clientSecret } = await response.json();
  return json({ clientSecret });
};

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const result = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (result.error) {
      toast.error("Payment Error", {
        description: result.error.message || "An unexpected error occurred.",
      });
    } else {
      toast.success("Payment Successful", {
        description: "Your payment has been processed successfully.",
      });
      navigate("/payment-success");
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full mt-4"
      >
        {isProcessing ? "Processing..." : "Pay Now"}
      </Button>
    </form>
  );
};

export default function Checkout() {
  const { clientSecret } = useLoaderData<typeof loader>();
  const [stripeError, setStripeError] = useState<string | null>(null);

  const appearance: StripeElementsOptions["appearance"] = {
    theme: "stripe",
    variables: {
      colorPrimary: "#0F172A",
      colorBackground: "#ffffff",
      colorText: "#1e293b",
      colorDanger: "#ef4444",
      fontFamily:
        'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
      spacingUnit: "4px",
      borderRadius: "8px",
    },
    rules: {
      ".Input": {
        border: "1px solid #e2e8f0",
        boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      },
      ".Input:focus": {
        border: "1px solid #0F172A",
        boxShadow: "0 0 0 1px #0F172A",
      },
      ".Label": {
        fontWeight: "500",
      },
      ".Error": {
        color: "#ef4444",
      },
    },
  };

  const options: StripeElementsOptions = {
    clientSecret,
    appearance,
  };

  React.useEffect(() => {
    if (!window.ENV?.STRIPE_PUBLISHABLE_KEY) {
      setStripeError("Stripe key is not available");
    }
  }, []);

  if (stripeError) {
    return <div className="text-red-500">{stripeError}</div>;
  }

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Complete Your Purchase</CardTitle>
        </CardHeader>
        <CardContent>
          {clientSecret ? (
            <Elements stripe={getStripe()} options={options}>
              <CheckoutForm />
            </Elements>
          ) : (
            <p>Loading payment information...</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
