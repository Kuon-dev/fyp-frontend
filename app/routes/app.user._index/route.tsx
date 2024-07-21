import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ClientOnly } from "remix-utils/client-only";
import { LoaderFunction, json, redirect } from "@remix-run/node";
import { useLoaderData, useRouteError } from "@remix-run/react";
import ErrorComponent from "@/components/error/500";
import { checkAuthCookie } from "@/lib/router-guard";

export const ErrorBoundary = () => {
  const error = useRouteError();
  return <ErrorComponent />;
};

// Types (you may want to move these to a separate file)
interface DashboardData {
  purchaseHistory: {
    totalSpent: number;
    componentsBought: number;
    recentPurchases: Array<{
      codeRepo: {
        name: string;
      };
      createdAt: string;
    }>;
  };
  accountInfo: {
    email: string;
    emailVerified: boolean;
    profile?: {
      profileImg?: string;
      name?: string;
    };
  };
  usageStatistics: {
    mostUsedComponents: Array<{
      name: string;
      usageCount: number;
    }>;
  };
  recommendations: {
    recommendations: Array<{
      name: string;
    }>;
  };
}

export const loader: LoaderFunction = async ({ request }) => {
  if (!checkAuthCookie(request)) return redirect("/login");

  const cookieHeader = request.headers.get("Cookie");
  const res = await fetch(`${process.env.BACKEND_URL}/api/v1/user/dashboard`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Cookie: cookieHeader?.toString() ?? "",
    },
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to load dashboard data");

  const data: DashboardData = await res.json();
  return json({
    dashboardData: data,
    success: true,
  });
};

export default function UserDashboard() {
  const { dashboardData } = useLoaderData<{ dashboardData: DashboardData }>();

  return (
    <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
      <ClientOnly fallback={<LoadingComponent />}>
        {() => <DashboardContent data={dashboardData} />}
      </ClientOnly>
    </div>
  );
}

function DashboardContent({ data }: { data: DashboardData }) {
  const { purchaseHistory, accountInfo, usageStatistics, recommendations } =
    data;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold mb-4">User Dashboard</h1>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={accountInfo.profile?.profileImg} />
              <AvatarFallback>
                {accountInfo.email[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">
                {accountInfo.profile?.name || "N/A"}
              </p>
              <p className="text-sm text-gray-500">{accountInfo.email}</p>
              <Badge
                variant={accountInfo.emailVerified ? "success" : "destructive"}
              >
                {accountInfo.emailVerified ? "Verified" : "Not Verified"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Purchase History */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase History</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Total Spent: ${purchaseHistory.totalSpent.toFixed(2)}</p>
          <p>Components Bought: {purchaseHistory.componentsBought}</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Component</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchaseHistory.recentPurchases.map((purchase, index) => (
                <TableRow key={index}>
                  <TableCell>{purchase.codeRepo.name}</TableCell>
                  <TableCell>
                    {new Date(purchase.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={usageStatistics.mostUsedComponents}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="usageCount" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Components</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5">
            {recommendations.recommendations.map((component, index) => (
              <li key={index}>{component.name}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function LoadingComponent() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <p className="text-gray-500 dark:text-gray-400">
          Please wait while we are preparing the dashboard
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
