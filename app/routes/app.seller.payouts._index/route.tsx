import React, { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/data-table/data-table";
import { columns, filters, sellerPayoutRequestSchema } from "./table";
import { ClientOnly } from "remix-utils/client-only";
import { LoaderFunction, json, redirect } from "@remix-run/node";
import { useLoaderData, useRouteError } from "@remix-run/react";
import ErrorComponent from "@/components/error/500";
import { checkAuthCookie } from "@/lib/router-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { showErrorToast } from "@/lib/handle-error";

// Define a schema for the seller's balance
const sellerBalanceSchema = z.object({
  balance: z.number(),
  lastPayoutRequestDate: z.string().nullable(),
});

type SellerBalance = z.infer<typeof sellerBalanceSchema>;

// Hard-coded minimum payout amount
const MINIMUM_PAYOUT_AMOUNT = 50;

export const ErrorBoundary = () => {
  const error = useRouteError();
  return <ErrorComponent />;
};

export const loader: LoaderFunction = async ({ request }) => {
  const cookieHeader = request.headers.get("Cookie");
  if (!checkAuthCookie(request)) return redirect("/login");

  const res = await fetch(
    `${process.env.BACKEND_URL}/api/v1/seller/payout-requests`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Cookie: cookieHeader?.toString() ?? "",
      },
    },
  );

  if (!res.ok) throw new Error("Oh no! Something went wrong!");

  const data = await res.json();
  const validatedData = z.array(sellerPayoutRequestSchema).parse(data);

  return json({
    items: validatedData,
    success: true,
  });
};

export default function SellerPayoutRequestsPage() {
  const { items } = useLoaderData<typeof loader>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sellerBalance, setSellerBalance] = useState<SellerBalance | null>(
    null,
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const payoutRequestFormSchema = z.object({
    amount: z
      .number()
      .min(
        MINIMUM_PAYOUT_AMOUNT,
        `Minimum payout amount is $${MINIMUM_PAYOUT_AMOUNT}`,
      )
      .refine((val) => val <= (sellerBalance?.balance || 0), {
        message: "Amount cannot exceed your available balance",
      }),
  });
  type PayoutRequestFormData = z.infer<typeof payoutRequestFormSchema>;

  const form = useForm<PayoutRequestFormData>({
    resolver: zodResolver(payoutRequestFormSchema),
    defaultValues: {
      amount: MINIMUM_PAYOUT_AMOUNT,
    },
  });

  useEffect(() => {
    fetchSellerBalance();
  }, []);

  const fetchSellerBalance = async () => {
    try {
      const res = await fetch(
        `${window.ENV.BACKEND_URL}/api/v1/seller/balance`,
        {
          credentials: "include",
        },
      );
      if (!res.ok) throw new Error("Failed to fetch seller balance");
      const data = await res.json();
      const validatedData = sellerBalanceSchema.parse(data);
      setSellerBalance(validatedData);
    } catch (error) {
      console.log(error);
      showErrorToast(error);
    }
  };

  const handlePayoutRequest = async (data: PayoutRequestFormData) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(
        `${window.ENV.BACKEND_URL}/api/v1/seller/payout-requests`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ totalAmount: data.amount }),
        },
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to submit payout request");
      }

      toast.success("Payout request submitted successfully");
      setIsDialogOpen(false);
      form.reset();
      await fetchSellerBalance();
      // Refetch the payout requests here if needed
    } catch (error) {
      showErrorToast(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEligibleForPayout =
    sellerBalance && sellerBalance.balance >= MINIMUM_PAYOUT_AMOUNT;

  const isWithinCooldownPeriod = sellerBalance?.lastPayoutRequestDate
    ? new Date().getTime() -
        new Date(sellerBalance.lastPayoutRequestDate).getTime() <
      7 * 24 * 60 * 60 * 1000
    : false;

  const getEligibilityStatus = () => {
    if (isWithinCooldownPeriod) return { status: "Cooldown", color: "yellow" };
    if (!isEligibleForPayout) return { status: "Not Eligible", color: "red" };
    return { status: "Eligible", color: "green" };
  };

  const { status, color } = getEligibilityStatus();

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Remove leading zeros and non-numeric characters
    const sanitizedValue = value.replace(/^0+/, "").replace(/[^0-9.]/g, "");

    // Ensure there's only one decimal point
    const parts = sanitizedValue.split(".");
    const formattedValue =
      parts[0] + (parts.length > 1 ? "." + parts[1].slice(0, 2) : "");

    // Update the form
    form.setValue(
      "amount",
      formattedValue === "" ? 0 : parseFloat(formattedValue),
    );
  };

  return (
    <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
      <ClientOnly fallback={<LoadingComponent />}>
        {() => (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-4">
                <h2 className="text-2xl font-bold">Your Payout Requests</h2>
              </div>
              <div className="flex items-center space-x-4">
                <Badge
                  variant={color as "default" | "secondary" | "destructive"}
                >
                  {status}
                </Badge>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      disabled={!isEligibleForPayout || isWithinCooldownPeriod}
                    >
                      Request Payout
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Request Payout</DialogTitle>
                      <DialogDescription>
                        Enter the amount you want to request for payout. Your
                        current balance: ${sellerBalance?.balance.toFixed(2)}
                        <br />
                        <br />
                        You will not be eligible for another payout request
                        within 7 days once you submit this request.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(handlePayoutRequest)}
                        className="space-y-8"
                      >
                        <FormField
                          control={form.control}
                          name="amount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Amount</FormLabel>
                              <FormControl>
                                <Input
                                  type="text"
                                  inputMode="decimal"
                                  {...field}
                                  onChange={handleAmountChange}
                                  value={field.value === 0 ? "" : field.value}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <DialogFooter>
                          <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Submitting..." : "Submit Request"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <DataTable
              data={items ?? []}
              columns={columns}
              filters={filters}
              search="id"
            />
          </>
        )}
      </ClientOnly>
    </div>
  );
}

function LoadingComponent() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <p className="text-gray-500 dark:text-gray-400">
          Please wait while we are preparing the content
        </p>
        <div className="flex items-center space-x-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
