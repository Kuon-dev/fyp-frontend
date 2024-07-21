import React, { useMemo } from "react";
import { DataTable } from "@/components/data-table/data-table";
import {
  PayoutRequestSchema,
  columns,
  filters,
  payoutRequestSchema,
} from "./table";
import { ClientOnly } from "remix-utils/client-only";
import { LoaderFunction, json, redirect } from "@remix-run/node";
import { useLoaderData, useRouteError } from "@remix-run/react";
import ErrorComponent from "@/components/error/500";
import { checkAuthCookie } from "@/lib/router-guard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Cell,
  Legend,
  Pie,
  Tooltip,
  PieChart,
  ResponsiveContainer,
} from "recharts";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  XCircle,
} from "lucide-react";
import LoadingComponent from "@/components/custom/loading";

export const ErrorBoundary = () => {
  return <ErrorComponent />;
};

export const loader: LoaderFunction = async ({ request }) => {
  const cookieHeader = request.headers.get("Cookie");
  if (!checkAuthCookie(request)) return redirect("/login");
  const res = await fetch(
    `${process.env.BACKEND_URL}/api/v1/admin/payout-requests`,
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
  return json({
    items: data,
    success: true,
  });
};

export default function PayoutRequestsPage() {
  const { items } = useLoaderData<typeof loader>();

  const payoutRequests = useMemo(() => {
    return items.map((item: unknown) => payoutRequestSchema.parse(item));
  }, [items]);

  const statusCounts = useMemo(() => {
    return payoutRequests.reduce(
      (acc: Record<string, number>, request: PayoutRequestSchema) => {
        acc[request.status] = (acc[request.status] || 0) + 1;
        return acc;
      },
      {},
    );
  }, [payoutRequests]);

  const totalAmount = useMemo(() => {
    return payoutRequests.reduce(
      (sum: number, request: PayoutRequestSchema) => sum + request.totalAmount,
      0,
    );
  }, [payoutRequests]);

  const pendingAmount = useMemo(() => {
    return payoutRequests
      .filter((request: PayoutRequestSchema) => request.status === "PENDING")
      .reduce(
        (sum: number, request: PayoutRequestSchema) =>
          sum + request.totalAmount,
        0,
      );
  }, [payoutRequests]);

  return (
    <div className="flex flex-col space-y-8 p-8">
      <Header />
      <div className="grid grid-cols-3 gap-4">
        <StatusDistributionChart statusCounts={statusCounts} />
        <InfoPanel
          totalRequests={payoutRequests.length}
          statusCounts={statusCounts}
          totalAmount={totalAmount}
          pendingAmount={pendingAmount}
        />
      </div>
      <ClientOnly fallback={<LoadingComponent />}>
        {() => (
          <DataTable
            data={payoutRequests}
            columns={columns}
            filters={filters}
            search="email"
          />
        )}
      </ClientOnly>
    </div>
  );
}

function Header() {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">
          Payout Requests
        </h2>
        <p className="text-sm text-muted-foreground">
          Manage and process payout requests from sellers.
        </p>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  Icon: React.ElementType;
}

function StatCard({ title, value, Icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 py-2 px-3">
        <CardTitle className="text-xs font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="py-2 px-3">
        <div className="text-xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

interface StatusDistributionChartProps {
  statusCounts: Record<string, number>;
}

const STATUS_COLORS = {
  PENDING: "#FFCE56",
  REJECTED: "#FF6384",
  PROCESSED: "#36A2EB",
};

const StatusDistributionChart: React.FC<StatusDistributionChartProps> = ({
  statusCounts,
}) => {
  const data = Object.entries(statusCounts).map(([status, count]) => ({
    name: status,
    value: count,
  }));

  const chartConfig: ChartConfig = {
    PENDING: { label: "Pending", color: STATUS_COLORS.PENDING },
    REJECTED: { label: "Rejected", color: STATUS_COLORS.REJECTED },
    PROCESSED: { label: "Processed", color: STATUS_COLORS.PROCESSED },
  };

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS]
                    }
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => {
                  const total = data.reduce((sum, item) => sum + item.value, 0);
                  const percent = ((value / total) * 100).toFixed(1);
                  return [`${value} (${percent}%)`, name];
                }}
              />
              <Legend layout="vertical" align="right" verticalAlign="middle" />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

interface InfoPanelProps {
  totalRequests: number;
  statusCounts: Record<string, number>;
  totalAmount: number;
  pendingAmount: number;
}

function InfoPanel({
  totalRequests,
  statusCounts,
  totalAmount,
  pendingAmount,
}: InfoPanelProps) {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Payout Request Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <StatCard title="Total Requests" value={totalRequests} Icon={Users} />
          <StatCard
            title="Pending"
            value={statusCounts["PENDING"] || 0}
            Icon={Clock}
          />
          <StatCard
            title="Processed"
            value={statusCounts["PROCESSED"] || 0}
            Icon={CheckCircle}
          />
          <StatCard
            title="Rejected"
            value={statusCounts["REJECTED"] || 0}
            Icon={XCircle}
          />
          <StatCard
            title="Total Amount"
            value={`$${totalAmount.toFixed(2)}`}
            Icon={DollarSign}
          />
          <StatCard
            title="Pending Amount"
            value={`$${pendingAmount.toFixed(2)}`}
            Icon={AlertCircle}
          />
        </div>
        <div className="mt-4 flex items-center space-x-4">
          <Badge variant="secondary" className="flex items-center space-x-1">
            <DollarSign className="h-4 w-4" />
            <span>{totalRequests} Total Requests</span>
          </Badge>
          <Badge variant="warning" className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{statusCounts["PENDING"] || 0} Pending</span>
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
