import React from "react";
import { toast } from "sonner";
import { showErrorToast } from "@/lib/handle-error";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "@remix-run/react";
import {
  SellerProfileFormData,
  SellerProfileEditComponent,
} from "@/components/user/seller-form";
import { Shell } from "@/components/landing/shell";
import { useUserStore } from "@/stores/user-store";
import PendingSellerComponent from "@/components/user/seller-pending";

// Component for idle status
const IdleSellerComponent: React.FC<{
  onSubmit: (data: SellerProfileFormData) => Promise<void>;
}> = ({ onSubmit }) => (
  <>
    <Card className="mb-8 bg-muted/40">
      <CardContent className="pt-6">
        <h2 className="text-2xl font-semibold mb-4">Become a Kortex Seller</h2>
        <p className="mb-4">
          Welcome to Kortex! We're excited that you're interested in becoming a
          seller on our platform. As a Kortex seller, you'll have the
          opportunity to monetize your coding skills and share your expertise
          with developers worldwide.
        </p>
        <p className="mb-4">
          To get started, please fill out the application form below. We'll need
          some information about your business and a bank account for payments.
        </p>
        <p>
          Once you submit your application, our team will review it carefully.
          This process typically takes 1-3 business days. We'll notify you via
          email as soon as a decision has been made.
        </p>
      </CardContent>
    </Card>
    <h2 className="text-2xl font-semibold mb-6">Seller Application Form</h2>
    <SellerProfileEditComponent onSubmit={onSubmit} />
  </>
);

// Component for rejected status
const RejectedSellerComponent: React.FC<{
  onSubmit: (data: SellerProfileFormData) => Promise<void>;
}> = ({ onSubmit }) => (
  <>
    <Card className="mb-8 bg-muted/40">
      <CardContent className="pt-6">
        <h2 className="text-2xl font-semibold mb-4 text-red-600">
          Application Status: Rejected
        </h2>
        <p className="mb-4">
          We regret to inform you that your previous seller application was not
          approved. However, we encourage you to address the issues noted and
          reapply.
        </p>
        <p className="mb-4">
          Common reasons for rejection include:
          <ul className="list-disc list-inside">
            <li>Incomplete or inaccurate business information</li>
            <li>Unverifiable identity documents</li>
            <li>Issues with the provided bank account details</li>
          </ul>
        </p>
        <p>
          Please review your information carefully and submit a new application
          below. If you have any questions about the rejection or need
          assistance, please contact our support team.
        </p>
      </CardContent>
    </Card>
    <h2 className="text-2xl font-semibold mb-6">Reapply as a Seller</h2>
    <SellerProfileEditComponent onSubmit={onSubmit} />
  </>
);

// Component for active status
const ActiveSellerComponent: React.FC = () => (
  <Card className="mb-8 bg-muted/40">
    <CardContent className="pt-6">
      <h2 className="text-2xl font-semibold mb-4">Welcome, Verified Seller!</h2>
      <p className="mb-4">
        Congratulations! Your seller account is now active. You can start
        listing your code snippets and earning on the Kortex platform.
      </p>
      <p>
        Use the navigation menu to access your seller dashboard, manage your
        listings, and track your earnings.
      </p>
    </CardContent>
  </Card>
);

const SellerDashboardComponent: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();

  const handleSubmit = async (data: SellerProfileFormData) => {
    try {
      const response = await fetch(
        `${window.ENV.BACKEND_URL}/api/v1/seller/apply`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        },
      );
      if (!response.ok) {
        throw new Error("Failed to submit seller application");
      }
      const result = await response.json();
      if (result.profile) {
        toast.success("Seller profile application submitted successfully");
        navigate("/app/seller");
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (error) {
      showErrorToast(error);
      console.error("Error applying for seller profile:", error);
    }
  };

  const renderContent = () => {
    const status = user?.sellerProfile?.verificationStatus || "IDLE";
    switch (status) {
      case "ACTIVE":
        return <ActiveSellerComponent />;
      case "PENDING":
        return <PendingSellerComponent />;
      case "REJECTED":
        return <RejectedSellerComponent onSubmit={handleSubmit} />;
      case "IDLE":
      default:
        return <IdleSellerComponent onSubmit={handleSubmit} />;
    }
  };

  return (
    <Shell className="container mx-auto px-4 py-8 bg-muted/40">
      <h1 className="text-3xl font-bold mb-6">Kortex Seller Dashboard</h1>
      {renderContent()}
    </Shell>
  );
};

export default SellerDashboardComponent;
