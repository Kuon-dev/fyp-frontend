import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/data-table/data-table";
import { ClientOnly } from "remix-utils/client-only";
import { LoaderFunction, json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import ErrorComponent from "@/components/error/500";
import { checkAuthCookie } from "@/lib/router-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { z } from "zod";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";

// Updated schema to match the new backend structure
const dashboardDataSchema = z.object({
  salesOverview: z.object({
    totalRevenue: z.number(),
    totalSales: z.number(),
    averageOrderValue: z.number(),
    dailySales: z.object({ revenue: z.number(), salesCount: z.number() }),
    weeklySales: z.object({ revenue: z.number(), salesCount: z.number() }),
    monthlySales: z.object({ revenue: z.number(), salesCount: z.number() }),
  }),
  userStatistics: z.object({
    totalUsers: z.number(),
    userTypeCounts: z.record(z.number()),
    newUsers: z.number(),
  }),
  repoMetrics: z.object({
    totalRepos: z.number(),
    pendingApprovalRepos: z.number(),
    popularRepos: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        _count: z.object({ orders: z.number() }),
      }),
    ),
    recentRepos: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        createdAt: z.string(),
      }),
    ),
  }),
  sellerPerformance: z.object({
    topSellers: z.array(
      z.object({
        id: z.string(),
        email: z.string(),
        profile: z.object({ name: z.string().nullable() }).optional(),
        sellerProfile: z
          .object({
            balance: z.number(),
            verificationStatus: z.enum([
              "IDLE",
              "PENDING",
              "APPROVED",
              "REJECTED",
            ]),
          })
          .nullable(),
        _count: z.object({ orders: z.number() }),
      }),
    ),
    newSellerApplications: z.number(),
  }),
  orderManagement: z.object({
    recentOrders: z.array(
      z.object({
        id: z.string(),
        userId: z.string(),
        codeRepoId: z.string(),
        createdAt: z.string(),
        status: z.enum([
          "REQUIRESPAYMENTMETHOD",
          "REQUIRESCONFIRMATION",
          "REQUIRESACTION",
          "PROCESSING",
          "REQUIRESCAPTURE",
          "CANCELLED",
          "SUCCEEDED",
        ]),
        totalAmount: z.number(),
        user: z.object({ email: z.string() }),
        codeRepo: z.object({ name: z.string() }),
      }),
    ),
    orderStatusCounts: z.record(z.number()),
  }),
  financialInsights: z.object({
    currentMonthRevenue: z.number(),
    previousMonthRevenue: z.number(),
    revenueGrowth: z.number(),
    pendingPayouts: z.number(),
    processedPayouts: z.number(),
    topSellingRepos: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        language: z.enum(["JSX", "TSX"]),
        totalRevenue: z.number(),
      }),
    ),
  }),
  supportTickets: z.object({
    openTicketsCount: z.number(),
    averageResponseTime: z.number().nullable(),
    ticketStatusCounts: z.record(z.number()),
  }),
  contentModeration: z.object({
    flaggedReviews: z.number(),
    flaggedComments: z.number(),
    totalFlaggedContent: z.number(),
  }),
});

type DashboardData = z.infer<typeof dashboardDataSchema>;

export const ErrorBoundary = () => {
  return <ErrorComponent />;
};

export const loader: LoaderFunction = async ({ request }) => {
  const cookieHeader = request.headers.get("Cookie");
  if (!checkAuthCookie(request)) return redirect("/login");
  const res = await fetch(`${process.env.BACKEND_URL}/api/v1/admin/dashboard`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Cookie: cookieHeader?.toString() ?? "",
    },
  });
  if (!res.ok) throw new Error("Failed to fetch admin dashboard data");
  const data = await res.json();
  return json(dashboardDataSchema.parse(data));
};

const recentOrderColumns: ColumnDef<
  DashboardData["orderManagement"]["recentOrders"][number]
>[] = [
  {
    accessorKey: "user.email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User Email" />
    ),
  },
  {
    accessorKey: "codeRepo.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Repo Name" />
    ),
  },
  {
    accessorKey: "totalAmount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Amount" />
    ),
    cell: ({ row }) => `$${row.getValue<number>("totalAmount").toFixed(2)}`,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) =>
      new Date(row.getValue<string>("createdAt")).toLocaleDateString(),
  },
];

const orderFilters = [
  {
    columnId: "status",
    title: "Status",
    options: [
      { label: "Requires Payment Method", value: "REQUIRESPAYMENTMETHOD" },
      { label: "Requires Confirmation", value: "REQUIRESCONFIRMATION" },
      { label: "Requires Action", value: "REQUIRESACTION" },
      { label: "Processing", value: "PROCESSING" },
      { label: "Requires Capture", value: "REQUIRESCAPTURE" },
      { label: "Cancelled", value: "CANCELLED" },
      { label: "Succeeded", value: "SUCCEEDED" },
    ],
  },
];

export default function AdminDashboard() {
  const dashboardData = useLoaderData<DashboardData>();

  return (
    <div className="space-y-4 p-8">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Users"
          value={dashboardData.userStatistics.totalUsers}
        />
        <MetricCard
          title="Total Revenue"
          value={`$${dashboardData.salesOverview.totalRevenue.toFixed(2)}`}
        />
        <MetricCard
          title="Total Sales"
          value={dashboardData.salesOverview.totalSales}
        />
        <MetricCard
          title="Avg. Order Value"
          value={`$${dashboardData.salesOverview.averageOrderValue.toFixed(2)}`}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={[
                  { name: "Daily", ...dashboardData.salesOverview.dailySales },
                  {
                    name: "Weekly",
                    ...dashboardData.salesOverview.weeklySales,
                  },
                  {
                    name: "Monthly",
                    ...dashboardData.salesOverview.monthlySales,
                  },
                ]}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
                <Bar dataKey="salesCount" fill="#82ca9d" name="Sales Count" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Sellers</CardTitle>
          </CardHeader>
          <CardContent>
            <ul>
              {dashboardData.sellerPerformance.topSellers.map(
                (seller, index) => (
                  <li key={seller.id} className="mb-2">
                    {index + 1}. {seller.profile?.name || seller.email} - $
                    {seller.sellerProfile?.balance.toFixed(2) ?? "N/A"} (
                    {seller._count.orders} orders)
                  </li>
                ),
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <ClientOnly fallback={<LoadingComponent />}>
            {() => (
              <DataTable
                data={dashboardData.orderManagement.recentOrders}
                columns={recentOrderColumns}
                filters={orderFilters}
                search="user.email"
              />
            )}
          </ClientOnly>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Pending Repo Approvals"
          value={dashboardData.repoMetrics.pendingApprovalRepos}
        />
        <MetricCard
          title="Open Support Tickets"
          value={dashboardData.supportTickets.openTicketsCount}
        />
        <MetricCard
          title="Flagged Content"
          value={dashboardData.contentModeration.totalFlaggedContent}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Financial Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p>
                Current Month Revenue: $
                {dashboardData.financialInsights.currentMonthRevenue.toFixed(2)}
              </p>
              <p>
                Previous Month Revenue: $
                {dashboardData.financialInsights.previousMonthRevenue.toFixed(
                  2,
                )}
              </p>
              <p>
                Revenue Growth:{" "}
                {dashboardData.financialInsights.revenueGrowth.toFixed(2)}%
              </p>
            </div>
            <div>
              <p>
                Pending Payouts: $
                {dashboardData.financialInsights.pendingPayouts.toFixed(2)}
              </p>
              <p>
                Processed Payouts: $
                {dashboardData.financialInsights.processedPayouts.toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: number | string;
}

function MetricCard({ title, value }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
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
