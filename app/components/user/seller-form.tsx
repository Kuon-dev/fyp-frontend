import React, { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { PhoneInput } from "@/components/custom/phone-input.client";
import { ClientOnly } from "remix-utils/client-only";
import { showErrorToast } from "@/lib/handle-error";
import { isValidPhoneNumber } from "react-phone-number-input";
import { useUserStore } from "@/stores/user-store";
import { toast } from "sonner";

// Zod schema for form validation
const sellerProfileSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  businessAddress: z.string().min(1, "Business address is required"),
  businessPhone: z
    .string()
    .refine(isValidPhoneNumber, { message: "Invalid phone number" }),
  businessEmail: z.string().email("Invalid email address"),
  accountHolderName: z.string().min(1, "Account holder name is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  bankName: z.string().min(1, "Bank name is required"),
  swiftCode: z
    .string()
    .min(8)
    .max(11, "SWIFT code must be between 8 and 11 characters"),
  iban: z.string().optional(),
  routingNumber: z.string().optional(),
});

export type SellerProfileFormData = z.infer<typeof sellerProfileSchema>;

interface SellerProfileEditComponentProps {
  initialData?: SellerProfileFormData;
  onSubmit: (data: SellerProfileFormData) => Promise<void>;
  isAdmin?: boolean;
}

export const SellerProfileEditComponent: React.FC<
  SellerProfileEditComponentProps
> = ({ initialData, onSubmit, isAdmin = false }) => {
  const { user, isLoading, checkLoginStatus } = useUserStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const form = useForm<SellerProfileFormData>({
    resolver: zodResolver(sellerProfileSchema),
    defaultValues: initialData || {
      businessName: "",
      businessAddress: "",
      businessPhone: "",
      businessEmail: "",
      accountHolderName: "",
      accountNumber: "",
      bankName: "",
      swiftCode: "",
      iban: "",
      routingNumber: "",
    },
  });

  useEffect(() => {
    const initializeUser = async () => {
      if (!isAdmin) {
        await checkLoginStatus();
      }
      setInitialLoading(false);
    };
    initializeUser();
  }, [isAdmin, checkLoginStatus]);

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    } else if (!isAdmin && user?.sellerProfile) {
      form.reset({
        businessName: user.sellerProfile.businessName,
        businessAddress: user.sellerProfile.businessAddress,
        businessPhone: user.sellerProfile.businessPhone,
        businessEmail: user.sellerProfile.businessEmail,
        accountHolderName:
          user.sellerProfile.bankAccount?.accountHolderName || "",
        accountNumber: user.sellerProfile.bankAccount?.accountNumber || "",
        bankName: user.sellerProfile.bankAccount?.bankName || "",
        swiftCode: user.sellerProfile.bankAccount?.swiftCode || "",
        iban: user.sellerProfile.bankAccount?.iban || "",
        routingNumber: user.sellerProfile.bankAccount?.routingNumber || "",
      });
    }
  }, [initialData, isAdmin, user, form]);

  const handleSubmit: SubmitHandler<SellerProfileFormData> = async (data) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await onSubmit(data);
    } catch (error) {
      showErrorToast(error);
      console.error("Error updating seller profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (initialLoading || (!isAdmin && isLoading)) {
    return (
      <div className="py-5 px-4 md:px-6 space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (!isAdmin && (!user || !user.sellerProfile)) {
    return <div>Error: Unable to load seller profile data</div>;
  }

  return (
    <ClientOnly>
      {() => (
        <div className="py-5">
          <div className="px-4 md:px-6 py-3 space-y-6">
            <header className="space-y-1.5">
              <h1 className="text-2xl font-bold">
                {isAdmin
                  ? "Edit Seller Profile (Admin)"
                  : "Edit Seller Profile"}
              </h1>
            </header>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-8"
              >
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">
                    Business Information
                  </h2>
                  <FormField
                    control={form.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="businessAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Address</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="businessPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Phone</FormLabel>
                        <FormControl>
                          <PhoneInput {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="businessEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">
                    Bank Account Information
                  </h2>
                  <FormField
                    control={form.control}
                    name="accountHolderName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Holder Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="accountNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Number</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bankName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="swiftCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SWIFT Code</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="iban"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>IBAN (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="routingNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Routing Number (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update Seller Profile"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      )}
    </ClientOnly>
  );
};

export default SellerProfileEditComponent;
