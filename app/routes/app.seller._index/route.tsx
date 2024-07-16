import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { showErrorToast } from "@/lib/handle-error";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "@remix-run/react";
import {
  SellerProfileFormData,
  SellerProfileEditComponent,
} from "@/components/user/seller-form";
import { Shell } from "@/components/landing/shell";
import { useUserStore } from "@/stores/user-store";
import PendingSellerComponent from "@/components/user/seller-pending";
import { DataTableLoadingComponent } from "@/components/dashboard/loading";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line,
  LineChart,
} from "recharts";
//import { ClientOnly } from "remix-utils/client-only";

interface SalesDataPoint {
  date: string;
  revenue: number;
  salesCount: number;
}

interface RecentReview {
  id: string;
  content: string;
  rating: number;
  createdAt: string;
  repoName: string;
  userName: string;
}

interface DashboardData {
  salesData: SalesDataPoint[];
  recentReviews: RecentReview[];
}

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

const ActiveSellerComponent: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(
          `${window.ENV.BACKEND_URL}/api/v1/seller/dashboard`,
          {
            credentials: "include",
          },
        );
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }
        const data: DashboardData = await response.json();
        setDashboardData(data);
      } catch (err) {
        setError("An error occurred while fetching dashboard data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <Card className="mb-8 bg-muted/40">
        <CardContent className="pt-6 flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const chartConfig: ChartConfig = {
    revenue: {
      label: "Revenue",
      color: "#8884d8",
    },
    salesCount: {
      label: "Sales Count",
      color: "#82ca9d",
    },
  };

  return (
    <div className="space-y-6">
      <Card className="mb-8 bg-muted/40">
        <CardHeader>
          <CardTitle>Welcome, Verified Seller!</CardTitle>
        </CardHeader>
        <CardContent>
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

      {dashboardData && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={chartConfig}
                className="min-h-[300px] w-full"
              >
                <LineChart data={dashboardData.salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString()
                    }
                  />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-revenue)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="salesCount"
                    stroke="var(--color-salesCount)"
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData.recentReviews.map((review) => (
                <div key={review.id} className="mb-4 p-4 border rounded">
                  <h4 className="font-semibold">{review.repoName}</h4>
                  <p className="text-sm text-gray-500">
                    By {review.userName} on{" "}
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                  <p className="mt-2">{review.content}</p>
                  <p className="mt-1 text-yellow-500">
                    Rating: {review.rating}/5
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

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
    const status = user?.sellerProfile?.verificationStatus || "";
    switch (status) {
      case "APPROVED":
        return <ActiveSellerComponent />;
      case "PENDING":
        return <PendingSellerComponent />;
      case "REJECTED":
        return <RejectedSellerComponent onSubmit={handleSubmit} />;
      case "IDLE":
        return <IdleSellerComponent onSubmit={handleSubmit} />;
      default:
        return (
          <div className="flex justify-center">
            <DataTableLoadingComponent />
          </div>
        );
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
