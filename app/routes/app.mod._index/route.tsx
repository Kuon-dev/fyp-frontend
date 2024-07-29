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
import LoadingComponent from "@/components/custom/loading";

const UserCommentFlag = {
  NONE: "NONE",
  SPAM: "SPAM",
  INAPPROPRIATE_LANGUAGE: "INAPPROPRIATE_LANGUAGE",
  HARASSMENT: "HARASSMENT",
  OFF_TOPIC: "OFF_TOPIC",
  FALSE_INFORMATION: "FALSE_INFORMATION",
  OTHER: "OTHER",
} as const;

const SupportTicketStatus = {
  inProgress: "inProgress",
  todo: "todo",
  backlog: "backlog",
  done: "done",
} as const;

// Updated schema to match the moderator dashboard structure
const moderatorDashboardDataSchema = z.object({
  contentModerationOverview: z.object({
    totalFlaggedContent: z.number(),
    awaitingModeration: z.number(),
    recentFlaggedContent: z.array(
      z.object({
        id: z.string(),
        content: z.string(),
        flag: z.nativeEnum(UserCommentFlag),
        user: z.object({ email: z.string() }),
      }),
    ),
  }),
  moderationActivity: z.object({
    moderatedLast24Hours: z.number(),
    moderatedLast7Days: z.number(),
    moderatedLast30Days: z.number(),
  }),
  userReportManagement: z.object({
    recentReports: z.array(
      z.object({
        id: z.string(),
        email: z.string(),
        title: z.string(),
        content: z.string(),
        status: z.nativeEnum(SupportTicketStatus),
        createdAt: z.date(),
      }),
    ),
    openReports: z.number(),
  }),
  contentAnalytics: z.object({
    activeDiscussions: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        _count: z.object({ reviews: z.number() }),
      }),
    ),
    trendingTopics: z.array(z.string()),
  }),
  userManagement: z.object({
    recentBans: z.array(
      z.object({
        id: z.string(),
        email: z.string(),
        bannedUntil: z.date(),
      }),
    ),
    usersWithMultipleFlags: z.array(
      z.object({
        id: z.string(),
        email: z.string(),
        _count: z.object({
          Review: z.number(),
          Comment: z.number(),
        }),
      }),
    ),
    totalSupportTickets: z.number(),
    unresolvedSupportTickets: z.number(),
  }),
  reviewAndCommentMetrics: z.object({
    totalReviews: z.number(),
    totalComments: z.number(),
    averageRating: z.number(),
    ratingDistribution: z.record(z.number()),
  }),
  moderationQueue: z.object({
    pendingReviews: z.array(
      z.object({
        id: z.string(),
        content: z.string(),
        user: z.object({ email: z.string() }),
        createdAt: z.date(),
      }),
    ),
    pendingComments: z.array(
      z.object({
        id: z.string(),
        content: z.string(),
        user: z.object({ email: z.string() }),
        createdAt: z.date(),
      }),
    ),
  }),
  moderatorPerformance: z.object({
    totalModeratedItems: z.number(),
    averageResponseTime: z.number(),
  }),
});

type ModeratorDashboardData = z.infer<typeof moderatorDashboardDataSchema>;

export const ErrorBoundary = () => {
  return <ErrorComponent />;
};

export const loader: LoaderFunction = async ({ request }) => {
  const cookieHeader = request.headers.get("Cookie");
  if (!checkAuthCookie(request)) return redirect("/login");
  const res = await fetch(`${process.env.BACKEND_URL}/api/v1/mod/dashboard`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Cookie: cookieHeader?.toString() ?? "",
    },
  });
  if (!res.ok) throw new Error("Failed to fetch moderator dashboard data");
  const data = await res.json();
  console.log(data);
  return json({
    data,
  });
};

const recentFlaggedContentColumns: ColumnDef<
  ModeratorDashboardData["contentModerationOverview"]["recentFlaggedContent"][number]
>[] = [
  {
    accessorKey: "user.email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User Email" />
    ),
  },
  {
    accessorKey: "content",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Content" />
    ),
    cell: ({ row }) => row.getValue<string>("content").substring(0, 50) + "...",
  },
  {
    accessorKey: "flag",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Flag" />
    ),
  },
];

const flaggedContentFilters = [
  {
    columnId: "flag",
    title: "Flag Type",
    options: Object.entries(UserCommentFlag).map(([key, value]) => ({
      label: key,
      value,
    })),
  },
];

const recentReportsColumns: ColumnDef<
  ModeratorDashboardData["userReportManagement"]["recentReports"][number]
>[] = [
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Reporter Email" />
    ),
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
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
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    cell: ({ row }) =>
      new Date(row.getValue<string>("createdAt")).toLocaleString(),
  },
];

const recentReportsFilters = [
  {
    columnId: "status",
    title: "Status",
    options: Object.entries(SupportTicketStatus).map(([key, value]) => ({
      label: key,
      value,
    })),
  },
];

export default function ModeratorDashboard() {
  const { data: dashboardData } = useLoaderData<{
    data: ModeratorDashboardData;
  }>();

  return (
    <div className="space-y-4 p-8">
      <h1 className="text-2xl font-bold">Moderator Dashboard</h1>

      <ClientOnly fallback={<LoadingComponent />}>
        {() => (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Total Flagged Content"
                value={
                  dashboardData.contentModerationOverview.totalFlaggedContent
                }
              />
              <MetricCard
                title="Awaiting Moderation"
                value={
                  dashboardData.contentModerationOverview.awaitingModeration
                }
              />
              <MetricCard
                title="Moderated (24h)"
                value={dashboardData.moderationActivity.moderatedLast24Hours}
              />
              <MetricCard
                title="Open Reports"
                value={dashboardData.userReportManagement.openReports}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Moderation Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart
                      data={[
                        {
                          name: "Last 24h",
                          value:
                            dashboardData.moderationActivity
                              .moderatedLast24Hours,
                        },
                        {
                          name: "Last 7d",
                          value:
                            dashboardData.moderationActivity.moderatedLast7Days,
                        },
                        {
                          name: "Last 30d",
                          value:
                            dashboardData.moderationActivity
                              .moderatedLast30Days,
                        },
                      ]}
                    >
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Bar
                        dataKey="value"
                        fill="#8884d8"
                        name="Moderated Items"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Review Ratings Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart
                      data={Object.entries(
                        dashboardData.reviewAndCommentMetrics
                          .ratingDistribution,
                      ).map(([rating, count]) => ({
                        rating: Number(rating),
                        count,
                      }))}
                    >
                      <XAxis dataKey="rating" />
                      <YAxis />
                      <Bar
                        dataKey="count"
                        fill="#82ca9d"
                        name="Number of Reviews"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Flagged Content</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={
                    dashboardData.contentModerationOverview.recentFlaggedContent
                  }
                  columns={recentFlaggedContentColumns}
                  filters={flaggedContentFilters}
                  search="user.email"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent User Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={dashboardData.userReportManagement.recentReports}
                  columns={recentReportsColumns}
                  filters={recentReportsFilters}
                  search="email"
                />
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Moderation Queue</CardTitle>
                </CardHeader>
                <CardContent>
                  <h3 className="text-lg font-semibold mb-2">
                    Pending Reviews
                  </h3>
                  <ul className="space-y-2">
                    {dashboardData.moderationQueue.pendingReviews
                      .slice(0, 5)
                      .map((review) => (
                        <li key={review.id} className="text-sm">
                          <span className="font-medium">
                            {review.user.email}
                          </span>
                          : {review.content.substring(0, 50)}...
                        </li>
                      ))}
                  </ul>
                  <h3 className="text-lg font-semibold mt-4 mb-2">
                    Pending Comments
                  </h3>
                  <ul className="space-y-2">
                    {dashboardData.moderationQueue.pendingComments
                      .slice(0, 5)
                      .map((comment) => (
                        <li key={comment.id} className="text-sm">
                          <span className="font-medium">
                            {comment.user.email}
                          </span>
                          : {comment.content.substring(0, 50)}...
                        </li>
                      ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <h3 className="text-lg font-semibold mb-2">Recent Bans</h3>
                  <ul className="space-y-2">
                    {dashboardData.userManagement.recentBans.map((ban) => (
                      <li key={ban.id} className="text-sm">
                        <span className="font-medium">{ban.email}</span> -
                        Banned until:{" "}
                        {new Date(ban.bannedUntil).toLocaleDateString()}
                      </li>
                    ))}
                  </ul>
                  <h3 className="text-lg font-semibold mt-4 mb-2">
                    Users with Multiple Flags
                  </h3>
                  <ul className="space-y-2">
                    {dashboardData.userManagement.usersWithMultipleFlags.map(
                      (user) => (
                        <li key={user.id} className="text-sm">
                          <span className="font-medium">{user.email}</span> -
                          Flags: {user._count.Review + user._count.Comment}
                        </li>
                      ),
                    )}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Total Reviews"
                value={dashboardData.reviewAndCommentMetrics.totalReviews}
              />
              <MetricCard
                title="Total Comments"
                value={dashboardData.reviewAndCommentMetrics.totalComments}
              />
              <MetricCard
                title="Average Rating"
                value={dashboardData.reviewAndCommentMetrics.averageRating.toFixed(
                  2,
                )}
              />
              <MetricCard
                title="Avg. Response Time"
                value={`${dashboardData.moderatorPerformance.averageResponseTime.toFixed(2)}h`}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Content Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="text-lg font-semibold mb-2">
                  Active Discussions
                </h3>
                <ul className="space-y-2">
                  {dashboardData.contentAnalytics.activeDiscussions.map(
                    (discussion) => (
                      <li key={discussion.id} className="text-sm">
                        <span className="font-medium">{discussion.name}</span> -
                        Reviews: {discussion._count.reviews}
                      </li>
                    ),
                  )}
                </ul>
                <h3 className="text-lg font-semibold mt-4 mb-2">
                  Trending Topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {dashboardData.contentAnalytics.trendingTopics.map(
                    (topic, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300"
                      >
                        {topic}
                      </span>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </ClientOnly>
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
