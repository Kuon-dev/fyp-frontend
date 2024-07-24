import React, { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/data-table/data-table";
import { columns, filters } from "./table";
import { ClientOnly } from "remix-utils/client-only";
import { LoaderFunction, json, redirect } from "@remix-run/node";
import { useLoaderData, useRouteError } from "@remix-run/react";
import ErrorComponent from "@/components/error/500";
import { checkAuthCookie } from "@/lib/router-guard";
import LoadingComponent from "@/components/custom/loading";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import {
  DollarSign,
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { z } from "zod";

const orderSchema = z.object({
  id: z.string(),
  userId: z.string(),
  codeRepoId: z.string(),
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
  stripePaymentIntentId: z.string().nullable(),
  stripePaymentMethodId: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
  user: z.object({
    email: z.string(),
  }),
  codeRepo: z.object({
    name: z.string(),
  }),
});

type OrderSchema = z.infer<typeof orderSchema>;

export const ErrorBoundary = () => {
  const error = useRouteError();
  return <ErrorComponent />;
};

export const loader: LoaderFunction = async ({ request }) => {
  const cookieHeader = request.headers.get("Cookie");
  if (!checkAuthCookie(request)) return redirect("/login");
  const res = await fetch(`${process.env.BACKEND_URL}/api/v1/orders`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Cookie: cookieHeader?.toString() ?? "",
    },
  });
  if (!res.ok) throw new Error("Oh no! Something went wrong!");
  const data = await res.json();
  const validatedData = z.array(orderSchema).parse(data.data);
  return json({
    items: validatedData,
    meta: data.meta,
    success: true,
  });
};

export default function OrdersPage() {
  const { items, meta } = useLoaderData<typeof loader>();

  const orderStats = useMemo(() => {
    const statusCounts = items.reduce(
      (acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const totalRevenue = items.reduce(
      (sum, order) => sum + order.totalAmount,
      0,
    );
    const successfulOrders = items.filter(
      (order) => order.status === "SUCCEEDED",
    );
    const totalSuccessfulRevenue = successfulOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0,
    );

    return {
      statusCounts,
      totalRevenue,
      totalSuccessfulRevenue,
      successfulOrdersCount: successfulOrders.length,
    };
  }, [items]);

  return (
    <div className="flex flex-col space-y-8 p-8">
      <Header
        totalOrders={items.length}
        totalRevenue={orderStats.totalRevenue}
      />
      <div className="grid grid-cols-3 gap-4">
        <OrderStatusChart statusCounts={orderStats.statusCounts} />
        <InfoPanel
          totalOrders={items.length}
          statusCounts={orderStats.statusCounts}
          totalRevenue={orderStats.totalRevenue}
          totalSuccessfulRevenue={orderStats.totalSuccessfulRevenue}
          successfulOrdersCount={orderStats.successfulOrdersCount}
        />
      </div>
      <ClientOnly fallback={<LoadingComponent />}>
        {() => (
          <DataTable
            data={items ?? []}
            columns={columns}
            filters={filters}
            search="email"
          />
        )}
      </ClientOnly>
    </div>
  );
}

function Header({ totalOrders, totalRevenue }) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">
          Order Management
        </h2>
        <p className="text-sm text-muted-foreground">
          Overview and details of all orders
        </p>
      </div>
      <div className="flex items-center space-x-4">
        <Badge variant="secondary" className="text-lg">
          Total Orders: {totalOrders}
        </Badge>
        <Badge variant="secondary" className="text-lg">
          Total Revenue: ${totalRevenue.toFixed(2)}
        </Badge>
      </div>
    </div>
  );
}

function OrderStatusChart({ statusCounts }) {
  const data = Object.entries(statusCounts).map(([status, count]) => ({
    name: status,
    value: count,
  }));

  const COLORS = {
    SUCCEEDED: "#4CAF50",
    CANCELLED: "#F44336",
    PROCESSING: "#2196F3",
    REQUIRESPAYMENTMETHOD: "#FFC107",
    REQUIRESCONFIRMATION: "#FF9800",
    REQUIRESACTION: "#9C27B0",
    REQUIRESCAPTURE: "#00BCD4",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Status Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[entry.name] || "#000000"}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function InfoPanel({
  totalOrders,
  statusCounts,
  totalRevenue,
  totalSuccessfulRevenue,
  successfulOrdersCount,
}) {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Order Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <StatCard
            title="Total Orders"
            value={totalOrders}
            Icon={ShoppingCart}
          />
          <StatCard
            title="Successful Orders"
            value={successfulOrdersCount}
            Icon={CheckCircle}
          />
          <StatCard
            title="Pending Orders"
            value={statusCounts["PROCESSING"] || 0}
            Icon={Clock}
          />
          <StatCard
            title="Cancelled Orders"
            value={statusCounts["CANCELLED"] || 0}
            Icon={XCircle}
          />
          <StatCard
            title="Total Revenue"
            value={`$${totalRevenue.toFixed(2)}`}
            Icon={DollarSign}
          />
          <StatCard
            title="Successful Revenue"
            value={`$${totalSuccessfulRevenue.toFixed(2)}`}
            Icon={DollarSign}
          />
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Conversion Rate</h3>
          <div className="text-3xl font-bold">
            {((successfulOrdersCount / totalOrders) * 100).toFixed(2)}%
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatCard({ title, value, Icon }) {
  return (
    <div className="flex flex-col items-center p-4 bg-secondary rounded-lg">
      <Icon className="h-8 w-8 mb-2" />
      <div className="text-sm font-medium text-muted-foreground">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
