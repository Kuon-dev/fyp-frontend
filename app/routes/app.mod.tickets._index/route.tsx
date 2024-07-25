import React, { useMemo } from "react";
import { DataTable } from "@/components/data-table/data-table";
import {
  SupportTicketSchema,
  columns,
  filters,
  supportTicketSchema,
} from "./table";
import { ClientOnly } from "remix-utils/client-only";
import { LoaderFunction, json, redirect } from "@remix-run/node";
import { useLoaderData, useRouteError } from "@remix-run/react";
import ErrorComponent from "@/components/error/500";
import { checkAuthCookie } from "@/lib/router-guard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  HelpCircle,
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
  const res = await fetch(`${process.env.BACKEND_URL}/api/v1/support/tickets`, {
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
    items: data.tickets,
    success: true,
  });
};

export default function SupportTicketsPage() {
  const { items } = useLoaderData<typeof loader>();

  const supportTickets = useMemo(() => {
    return items.map((item: unknown) => supportTicketSchema.parse(item));
  }, [items]);

  const statusCounts = useMemo(() => {
    return supportTickets.reduce(
      (acc: Record<string, number>, ticket: SupportTicketSchema) => {
        acc[ticket.status] = (acc[ticket.status] || 0) + 1;
        return acc;
      },
      {},
    );
  }, [supportTickets]);

  const typeCounts = useMemo(() => {
    return supportTickets.reduce(
      (acc: Record<string, number>, ticket: SupportTicketSchema) => {
        acc[ticket.type] = (acc[ticket.type] || 0) + 1;
        return acc;
      },
      {},
    );
  }, [supportTickets]);

  return (
    <div className="flex flex-col space-y-8 p-8">
      <Header />
      <div className="grid grid-cols-3 gap-4">
        <TypeDistributionChart typeCounts={typeCounts} />
        <InfoPanel
          totalTickets={supportTickets.length}
          statusCounts={statusCounts}
          typeCounts={typeCounts}
        />
      </div>
      <ClientOnly fallback={<LoadingComponent />}>
        {() => (
          <DataTable
            data={supportTickets}
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
          Support Tickets
        </h2>
        <p className="text-sm text-muted-foreground">
          Manage and respond to customer support tickets.
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

interface TypeDistributionChartProps {
  typeCounts: Record<string, number>;
}

const TYPE_COLORS = {
  general: "#FFCE56",
  technical: "#FF6384",
  payment: "#36A2EB",
};

const TypeDistributionChart: React.FC<TypeDistributionChartProps> = ({
  typeCounts,
}) => {
  const data = Object.entries(typeCounts).map(([type, count]) => ({
    name: type,
    count: count,
  }));

  const chartConfig: ChartConfig = {
    general: { label: "General", color: TYPE_COLORS.general },
    technical: { label: "Technical", color: TYPE_COLORS.technical },
    payment: { label: "Payment", color: TYPE_COLORS.payment },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ticket Type Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8">
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={TYPE_COLORS[entry.name as keyof typeof TYPE_COLORS]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

interface InfoPanelProps {
  totalTickets: number;
  statusCounts: Record<string, number>;
  typeCounts: Record<string, number>;
}

function InfoPanel({ totalTickets, statusCounts, typeCounts }: InfoPanelProps) {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Support Ticket Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <StatCard title="Total Tickets" value={totalTickets} Icon={Users} />
          <StatCard
            title="In Progress"
            value={statusCounts["inProgress"] || 0}
            Icon={Clock}
          />
          <StatCard
            title="Done"
            value={statusCounts["done"] || 0}
            Icon={CheckCircle}
          />
          <StatCard
            title="To Do"
            value={statusCounts["todo"] || 0}
            Icon={AlertCircle}
          />
          <StatCard
            title="Backlog"
            value={statusCounts["backlog"] || 0}
            Icon={XCircle}
          />
          <StatCard
            title="General"
            value={typeCounts["general"] || 0}
            Icon={HelpCircle}
          />
        </div>
        <div className="mt-4 flex items-center space-x-4">
          <Badge variant="secondary" className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>{totalTickets} Total Tickets</span>
          </Badge>
          <Badge variant="warning" className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{statusCounts["inProgress"] || 0} In Progress</span>
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
