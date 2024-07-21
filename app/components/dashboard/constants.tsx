import React from "react";
import {
  Home,
  Package,
  ShoppingCart,
  Users2,
  Settings,
  DollarSign,
  MessageSquare,
  Star,
  FileCode,
  Building,
} from "lucide-react";

export interface SidebarLink {
  to: string;
  icon: React.ReactNode;
  tooltip: string;
}

export interface RoleSidebarLinks {
  [key: string]: SidebarLink[];
}

const userLinks: SidebarLink[] = [
  { to: "/app", icon: <Home className="h-5 w-5" />, tooltip: "Dashboard" },
  {
    to: "/app/user/repos",
    icon: <Package className="h-5 w-5" />,
    tooltip: "Your code repos",
  },
  {
    to: "/app/user/purchases",
    icon: <ShoppingCart className="h-5 w-5" />,
    tooltip: "Your purchases",
  },
];

const sellerLinks: SidebarLink[] = [
  ...userLinks,
  {
    to: "/app/seller/repos",
    icon: <FileCode className="h-5 w-5" />,
    tooltip: "Seller Repos",
  },
  {
    to: "/app/seller/payouts",
    icon: <DollarSign className="h-5 w-5" />,
    tooltip: "Payouts",
  },
];

const moderatorLinks: SidebarLink[] = [
  {
    to: "/app/mod",
    icon: <Home className="h-5 w-5" />,
    tooltip: "Mod Dashboard",
  },
  {
    to: "/app/mod/comments",
    icon: <MessageSquare className="h-5 w-5" />,
    tooltip: "Moderate Comments",
  },
  {
    to: "/app/mod/reviews",
    icon: <Star className="h-5 w-5" />,
    tooltip: "Moderate Reviews",
  },
];

const adminLinks: SidebarLink[] = [
  {
    to: "/app/admin",
    icon: <Home className="h-5 w-5" />,
    tooltip: "Admin Dashboard",
  },
  {
    to: "/app/admin/users",
    icon: <Users2 className="h-5 w-5" />,
    tooltip: "User Management",
  },
  {
    to: "/app/admin/payouts",
    icon: <DollarSign className="h-5 w-5" />,
    tooltip: "Manage Payouts",
  },
];

const moderatorLinksWithoutDashboard = moderatorLinks.slice(1);

export const sidebarLinks: RoleSidebarLinks = {
  USER: userLinks,
  SELLER: sellerLinks,
  MODERATOR: moderatorLinks,
  ADMIN: [...adminLinks, ...moderatorLinksWithoutDashboard],
};

export const settingsLink: SidebarLink = {
  to: "/app/settings/profile",
  icon: <Settings className="h-5 w-5" />,
  tooltip: "Settings",
};
