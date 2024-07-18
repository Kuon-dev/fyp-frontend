import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { StripeElementsOptions } from "@stripe/stripe-js";

interface CheckoutState {
  clientSecret: string | null;
  isLoading: boolean;
  error: string | null;
  repoId: string | null;
  appearance: StripeElementsOptions["appearance"];
}

interface CheckoutActions {
  setClientSecret: (secret: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setRepoId: (repoId: string) => void;
  resetCheckout: () => void;
  initializeCheckout: (repoId: string) => Promise<void>;
  handlePurchase: (repoId: string) => Promise<boolean>;
}

type CheckoutStore = CheckoutState & CheckoutActions;

const DEFAULT_APPEARANCE: StripeElementsOptions["appearance"] = {
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

export const useCheckoutStore = create<CheckoutStore>()(
  devtools(
    persist(
      (set, get) => ({
        clientSecret: null,
        isLoading: false,
        error: null,
        repoId: null,
        appearance: DEFAULT_APPEARANCE,
        setClientSecret: (secret) => set({ clientSecret: secret }),
        setIsLoading: (isLoading) => set({ isLoading }),
        setError: (error) => set({ error }),
        setRepoId: (repoId) => set({ repoId }),
        resetCheckout: () =>
          set({
            clientSecret: null,
            isLoading: false,
            error: null,
            repoId: null,
          }),
        initializeCheckout: async (repoId) => {
          const { setIsLoading, setClientSecret, setError, setRepoId } = get();
          setIsLoading(true);
          setRepoId(repoId);
          try {
            const response = await fetch(
              `${window.ENV.BACKEND_URL}/api/v1/checkout`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ repoId }),
                credentials: "include",
              },
            );
            if (!response.ok) {
              throw new Error("Failed to create payment intent");
            }
            const { clientSecret } = await response.json();
            setClientSecret(clientSecret);
            setError(null);
          } catch (error) {
            setError(
              error instanceof Error
                ? error.message
                : "An unexpected error occurred",
            );
          } finally {
            setIsLoading(false);
          }
        },
        handlePurchase: async (repoId) => {
          const { setIsLoading, setClientSecret, setError, setRepoId } = get();
          setIsLoading(true);
          setRepoId(repoId);
          try {
            const response = await fetch(
              `${window.ENV.BACKEND_URL}/api/v1/checkout`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ repoId }),
                credentials: "include",
              },
            );
            if (!response.ok) {
              throw new Error("Failed to create checkout");
            }
            const { clientSecret } = await response.json();
            setClientSecret(clientSecret);
            setError(null);
            return true;
          } catch (error) {
            setError(
              error instanceof Error
                ? error.message
                : "An unexpected error occurred",
            );
            return false;
          } finally {
            setIsLoading(false);
          }
        },
      }),
      {
        name: "checkout-store",
        partialize: (state) => ({
          repoId: state.repoId,
          clientSecret: state.clientSecret,
          appearance: state.appearance,
        }),
      },
    ),
  ),
);
