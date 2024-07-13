import React, { useState } from "react";
import { useLoaderData } from "@remix-run/react";
import { LoaderFunction, json } from "@remix-run/node";
import { SellerProfileEditComponent } from "@/components/user/seller-form";
import type { SellerProfileFormData } from "@/components/user/seller-form";
import { showErrorToast } from "@/lib/handle-error";
import { toast } from "sonner";

// Define the type for the loader data
type LoaderData = {
  sellerProfile: SellerProfileFormData | null;
};

export const loader: LoaderFunction = async ({ request }) => {
  const response = await fetch(
    `${process.env.BACKEND_URL}/api/v1/seller-profile`,
    {
      headers: {
        Cookie: request.headers.get("Cookie") || "",
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch seller profile");
  }

  const sellerProfile = await response.json();

  const loaderData: LoaderData = {
    sellerProfile: sellerProfile
      ? {
          businessName: sellerProfile.businessName,
          businessAddress: sellerProfile.businessAddress,
          businessPhone: sellerProfile.businessPhone,
          businessEmail: sellerProfile.businessEmail,
          accountHolderName: sellerProfile.bankAccount?.accountHolderName || "",
          accountNumber: sellerProfile.bankAccount?.accountNumber || "",
          bankName: sellerProfile.bankAccount?.bankName || "",
          swiftCode: sellerProfile.bankAccount?.swiftCode || "",
          iban: sellerProfile.bankAccount?.iban || "",
          routingNumber: sellerProfile.bankAccount?.routingNumber || "",
        }
      : null,
  };

  return json(loaderData);
};

const SellerProfileEditPage: React.FC = () => {
  const { sellerProfile } = useLoaderData<LoaderData>();

  const handleSubmit = async (data: SellerProfileFormData) => {
    try {
      const response = await fetch(
        `${window.ENV.BACKEND_URL}/api/v1/seller-profile`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update seller profile");
      }

      toast.success("Seller profile updated successfully");
    } catch (error) {
      showErrorToast(error);
      console.error("Error updating seller profile:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Edit Your Seller Profile</h1>
      <SellerProfileEditComponent
        initialData={sellerProfile || undefined}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default SellerProfileEditPage;
