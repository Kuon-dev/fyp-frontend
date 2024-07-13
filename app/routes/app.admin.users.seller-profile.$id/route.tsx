import React from "react";
import { useLoaderData, useParams, Link } from "@remix-run/react";
import { LoaderFunction, json } from "@remix-run/node";
import { SellerProfileEditComponent } from "@/components/user/seller-form";
import type { SellerProfileFormData } from "@/components/user/seller-form";
//import { z } from 'zod';
import { showErrorToast } from "@/lib/handle-error";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

// Define the type for the loader data
type LoaderData = {
  sellerProfile: SellerProfileFormData;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const { id } = params;
  if (!id) {
    throw new Error("Seller Email is required");
  }

  const response = await fetch(
    `${process.env.BACKEND_URL}/api/v1/users/${id}`,
    {
      headers: {
        Cookie: request.headers.get("Cookie") || "",
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch seller profile");
  }

  const user = await response.json();
  console.log(user);

  const loaderData: LoaderData = {
    sellerProfile: {
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
    },
  };

  return json(loaderData);
};

const AdminSellerProfileEditPage: React.FC = () => {
  const { sellerProfile } = useLoaderData<LoaderData>();
  const { id } = useParams();

  const handleSubmit = async (data: SellerProfileFormData) => {
    try {
      const response = await fetch(
        `${window.ENV.BACKEND_URL}/api/v1/admin/seller-profile/${id}`,
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
      <Link to="/app/admin/users">
        <Button className="mb-4">Back</Button>
      </Link>
      <h2 className="text-xl font-bold mb-6">
        Editing profile for seller: {id}
      </h2>
      <SellerProfileEditComponent
        initialData={sellerProfile}
        onSubmit={handleSubmit}
        isAdmin={true}
      />
    </div>
  );
};

export default AdminSellerProfileEditPage;
