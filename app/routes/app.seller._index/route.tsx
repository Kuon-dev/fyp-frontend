import React, { useState } from "react";
import { toast } from "sonner";
import { showErrorToast } from "@/lib/handle-error";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "@remix-run/react";
import {
  SellerProfileFormData,
  SellerProfileEditComponent,
} from "@/components/user/seller-form";
import { Shell } from "@/components/landing/shell";

const ApplySellerProfileComponent: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = async (data: SellerProfileFormData) => {
    try {
      const response = await fetch("/api/v1/seller/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to submit seller application");
      }

      const result = await response.json();

      if (result.profile) {
        toast.success("Seller profile application submitted successfully");
        navigate("/app/seller"); // Redirect to dashboard or appropriate page
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (error) {
      showErrorToast(error);
      console.error("Error applying for seller profile:", error);
    }
  };

  return (
    <Shell className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        Welcome to Kortex Seller Program!
      </h1>

      <Card className="mb-8 bg-muted/40">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-semibold mb-4">
            Getting Started as a Seller
          </h2>
          <p className="mb-4">
            Congratulations on taking the first step towards becoming a Kortex
            seller! We're excited to have you join our community of talented
            developers.
          </p>
          <p className="mb-4">
            To complete your application, please fill out the form below with
            your business and bank account information. This will help us verify
            your identity and set up your seller account.
          </p>
          <p>
            Once your application is submitted, our team will review it and get
            back to you shortly. If approved, you'll be able to start selling
            your code snippets and earning on the Kortex platform!
          </p>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-semibold mb-6">Seller Application Form</h2>
      <SellerProfileEditComponent onSubmit={handleSubmit} />
    </Shell>
  );
};

export default ApplySellerProfileComponent;
