import React, { useMemo } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { UserSchema, columns, roleOptions, userSchema } from "./table";
import { ClientOnly } from "remix-utils/client-only";
import { LoaderFunction, json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import ErrorComponent from "@/components/error/500";
import { checkAuthCookie } from "@/lib/router-guard";
import LoadingComponent from "@/components/custom/loading";
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
import { Users, UserCheck, UserX, ShieldAlert, Mail, User } from "lucide-react";
import { z } from "zod";

export const ErrorBoundary = () => {
  return <ErrorComponent />;
};

export const loader: LoaderFunction = async ({ request }) => {
  const cookieHeader = request.headers.get("Cookie");
  if (!checkAuthCookie(request)) return redirect("/login");
  const res = await fetch(`${process.env.BACKEND_URL}/api/v1/users/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Cookie: cookieHeader?.toString() ?? "",
    },
  });
  if (!res.ok) throw new Error("Oh no! Something went wrong!");
  const data = await res.json();
  return json({
    items: z.array(userSchema).parse(data),
    success: res.ok,
  });
};

const filters = [
  {
    columnId: "role",
    title: "Role",
    options: roleOptions,
  },
];

export default function UserManagementPage() {
  const { items } = useLoaderData<typeof loader>();

  const roleCounts = useMemo(() => {
    return items.reduce((acc: Record<string, number>, user: UserSchema) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});
  }, [items]);

  const verifiedCount = useMemo(() => {
    return items.filter(
      (user: UserSchema) =>
        user.sellerProfile?.verificationStatus === "APPROVED",
    ).length;
  }, [items]);

  const bannedCount = useMemo(() => {
    return items.filter((user: UserSchema) => user.bannedUntil !== null).length;
  }, [items]);

  const pendingSellerCount = useMemo(() => {
    return items.filter(
      (user: UserSchema) =>
        user.sellerProfile?.verificationStatus === "PENDING",
    ).length;
  }, [items]);

  return (
    <div className="flex flex-col space-y-8 p-8">
      <Header />
      <div className="grid grid-cols-3 gap-4">
        <RoleDistributionChart roleCounts={roleCounts} />
        <InfoPanel
          totalUsers={items.length}
          roleCounts={roleCounts}
          verifiedCount={verifiedCount}
          bannedCount={bannedCount}
          pendingSellerCount={pendingSellerCount}
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

function Header() {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">
          User Management
        </h2>
        <p className="text-sm text-muted-foreground">
          Manage and monitor user accounts across the platform.
        </p>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
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

interface RoleDistributionChartProps {
  roleCounts: Record<string, number>;
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "#FF6384",
  USER: "#36A2EB",
  SELLER: "#FFCE56",
  MODERATOR: "#4BC0C0",
};

const RoleDistributionChart: React.FC<RoleDistributionChartProps> = ({
  roleCounts,
}) => {
  const data = Object.entries(roleCounts).map(([role, count]) => ({
    name: role,
    value: count,
  }));

  const chartConfig: ChartConfig = Object.fromEntries(
    Object.entries(ROLE_COLORS).map(([role, color]) => [
      role,
      { label: role, color },
    ]),
  );

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
        <CardTitle>Role Distribution</CardTitle>
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
                    fill={ROLE_COLORS[entry.name] || "#000000"}
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
  totalUsers: number;
  roleCounts: Record<string, number>;
  verifiedCount: number;
  bannedCount: number;
  pendingSellerCount: number;
}

function InfoPanel({
  totalUsers,
  roleCounts,
  verifiedCount,
  bannedCount,
  pendingSellerCount,
}: InfoPanelProps) {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>User Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <StatCard title="Total Users" value={totalUsers} Icon={Users} />
          <StatCard
            title="Verified Sellers"
            value={verifiedCount}
            Icon={UserCheck}
          />
          <StatCard title="Banned Users" value={bannedCount} Icon={UserX} />
          <StatCard
            title="Admins"
            value={roleCounts["ADMIN"] || 0}
            Icon={ShieldAlert}
          />
          <StatCard
            title="Moderators"
            value={roleCounts["MODERATOR"] || 0}
            Icon={User}
          />
          <StatCard
            title="Pending Sellers"
            value={pendingSellerCount}
            Icon={Mail}
          />
        </div>
        <div className="mt-4 flex items-center space-x-4">
          <Badge variant="secondary" className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>{totalUsers} Total Users</span>
          </Badge>
          <Badge variant="destructive" className="flex items-center space-x-1">
            <UserX className="h-4 w-4" />
            <span>{bannedCount} Banned</span>
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
