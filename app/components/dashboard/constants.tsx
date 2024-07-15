import React from "react";
import {
  Home,
  LineChart,
  Package,
  ShoppingCart,
  Users2,
  Settings,
  DollarSign,
  MessageSquare,
  Star,
} from "lucide-react";

export interface SidebarLink {
  to: string;
  icon: React.ReactNode;
  tooltip: string;
}

export interface RoleSidebarLinks {
  [key: string]: SidebarLink[];
}

const commonLinks: SidebarLink[] = [
  { to: "/app", icon: <Home className="h-5 w-5" />, tooltip: "Dashboard" },
  {
    to: "/app/repos",
    icon: <Package className="h-5 w-5" />,
    tooltip: "Your code repos",
  },
  {
    to: "/app/purchases",
    icon: <Package className="h-5 w-5" />,
    tooltip: "Your purchased repos",
  },
];

const moderatorLinks: SidebarLink[] = [
  ...commonLinks,
  {
    to: "/app/mod/comments",
    icon: <MessageSquare className="h-5 w-5" />,
    tooltip: "Comments",
  },
  {
    to: "/app/mod/reviews",
    icon: <Star className="h-5 w-5" />,
    tooltip: "Reviews",
  },
  {
    to: "/app/tickets",
    icon: <LineChart className="h-5 w-5" />,
    tooltip: "Tickets",
  },
];

export const sidebarLinks: RoleSidebarLinks = {
  admin: [
    ...moderatorLinks,
    {
      to: "/app/admin/payouts",
      icon: <DollarSign className="h-5 w-5" />,
      tooltip: "Payouts",
    },
    {
      to: "/app/admin/users",
      icon: <Users2 className="h-5 w-5" />,
      tooltip: "User Management",
    },
    {
      to: "/app/orders",
      icon: <ShoppingCart className="h-5 w-5" />,
      tooltip: "Your orders",
    },
  ],
  moderator: moderatorLinks,
  seller: [
    ...commonLinks,
    {
      to: "/app/orders",
      icon: <ShoppingCart className="h-5 w-5" />,
      tooltip: "Your orders",
    },
  ],
  buyer: commonLinks,
};

export const settingsLink: SidebarLink = {
  to: "/app/settings/profile",
  icon: <Settings className="h-5 w-5" />,
  tooltip: "Settings",
};
