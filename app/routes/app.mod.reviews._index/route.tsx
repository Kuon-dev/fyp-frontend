import React, { useMemo } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { ReviewSchema, columns, filters, flagOptions } from "./table";
import { ClientOnly } from "remix-utils/client-only";
import { LoaderFunction, json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Badge } from "@/components/ui/badge";
import ErrorComponent from "@/components/error/500";
import { checkAuthCookie } from "@/lib/router-guard";
import {
  AlertTriangle,
  Flag,
  Flame,
  HelpCircle,
  MessageCircle,
  XCircle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Cell,
  Legend,
  Pie,
  Tooltip,
  PieChart,
  ResponsiveContainer,
} from "recharts";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import LoadingComponent from "@/components/custom/loading";

export const ErrorBoundary = () => {
  //const error = useRouteError();
  return <ErrorComponent />;
};

export const loader: LoaderFunction = async ({ request }) => {
  const cookieHeader = request.headers.get("Cookie");
  if (!checkAuthCookie(request)) return redirect("/login");
  const res = await fetch(`${process.env.BACKEND_URL}/api/v1/admin/reviews`, {
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
    items: data as ReviewSchema,
    success: true,
  });
};

export default function FlaggedReviewsPage() {
  const reviews = useLoaderData<typeof loader>();

  const flagCounts = useMemo(() => {
    return (reviews.items as ReviewSchema[]).reduce(
      (acc, review) => {
        acc[review.flag] = (acc[review.flag] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
  }, [reviews.items]);

  const highPriorityReviews = useMemo(() => {
    return (reviews.items as ReviewSchema[]).filter(
      (review) =>
        review.flag === "HARASSMENT" || review.flag === "FALSE_INFORMATION",
    );
  }, [reviews.items]);

  return (
    <div className="flex flex-col space-y-8 p-8">
      <Header />
      <div className="grid grid-cols-3 gap-4">
        <FlagDistributionChart flagCounts={flagCounts} />
        <InfoPanel
          totalReviews={reviews.items.length}
          flagCounts={flagCounts}
          highPriorityCount={highPriorityReviews.length}
        />
      </div>
      <ClientOnly fallback={<LoadingComponent />}>
        {() => (
          <DataTable
            data={reviews.items ?? []}
            columns={columns}
            filters={filters}
            search="content"
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
          Flagged Reviews
        </h2>
        <p className="text-sm text-muted-foreground">
          Manage and moderate flagged reviews from users.
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

interface FlagDistributionChartProps {
  flagCounts: Record<string, number>;
}

interface FlagCount {
  name: string;
  value: number;
  key: string;
}

// Define a fixed set of colors for each flag type
const FLAG_COLORS = {
  FALSE_INFORMATION: "#FF6384",
  OTHER: "#36A2EB",
  HARASSMENT: "#FFCE56",
  OFF_TOPIC: "#4BC0C0",
  INAPPROPRIATE_LANGUAGE: "#9966FF",
  SPAM: "#FF9F40",
  // Add more colors for other flag types if needed
};

const FlagDistributionChart: React.FC<FlagDistributionChartProps> = ({
  flagCounts,
}) => {
  const data: FlagCount[] = Object.entries(flagCounts)
    .map(([key, value]) => ({
      name: flagOptions.find((option) => option.value === key)?.label || key,
      value: value,
      key: key, // Keep the original key for color mapping
    }))
    .sort((a, b) => b.value - a.value); // Sort data by value in descending order

  const chartConfig: ChartConfig = data.reduce((config, item) => {
    config[item.key] = {
      label: item.name,
      color: FLAG_COLORS[item.key as keyof typeof FLAG_COLORS] || "#000000",
    };
    return config;
  }, {} as ChartConfig);

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
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
        <CardTitle>Flag Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
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
                  fill={chartConfig[entry.key].color}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string, props: any) => {
                const total = data.reduce((sum, item) => sum + item.value, 0);
                const percent = ((value / total) * 100).toFixed(1);
                return [`${value} (${percent}%)`, name];
              }}
            />
            <Legend layout="vertical" align="right" verticalAlign="middle" />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

interface InfoPanelProps {
  flagCounts: Record<string, number>;
  totalReviews: number;
  highPriorityCount: number;
}

export function InfoPanel({
  flagCounts,
  totalReviews,
  highPriorityCount,
}: InfoPanelProps) {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Review Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <StatCard title="Total Flagged" value={totalReviews} Icon={Flag} />
          <StatCard
            title="Spam"
            value={flagCounts["SPAM"] || 0}
            Icon={MessageCircle}
          />
          <StatCard
            title="Inappropriate"
            value={flagCounts["INAPPROPRIATE_LANGUAGE"] || 0}
            Icon={Flame}
          />
          <StatCard
            title="Harassment"
            value={flagCounts["HARASSMENT"] || 0}
            Icon={AlertTriangle}
          />
          <StatCard
            title="False Information"
            value={flagCounts["FALSE_INFORMATION"] || 0}
            Icon={XCircle}
          />
          <StatCard
            title="Other"
            value={flagCounts["OTHER"] || 0}
            Icon={HelpCircle}
          />
        </div>
        <div className="mt-4 flex items-center space-x-4">
          <Badge variant="secondary" className="flex items-center space-x-1">
            <Flag className="h-4 w-4" />
            <span>{totalReviews} Flagged</span>
          </Badge>
          <Badge variant="destructive" className="flex items-center space-x-1">
            <AlertTriangle className="h-4 w-4" />
            <span>{highPriorityCount} High Priority</span>
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
