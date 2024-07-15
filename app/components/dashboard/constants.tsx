import React from "react";
import {
  Home,
  LineChart,
  Package,
  ShoppingCart,
  Users2,
  Settings,
} from "lucide-react";

export interface SidebarLink {
  to: string;
  icon: React.ReactNode;
  tooltip: string;
}

export interface RoleSidebarLinks {
  [key: string]: SidebarLink[];
}

export const sidebarLinks: RoleSidebarLinks = {
  admin: [
    { to: "/app", icon: <Home className="h-5 w-5" />, tooltip: "Dashboard" },
    {
      to: "/repos",
      icon: <Package className="h-5 w-5" />,
      tooltip: "Your code repos",
    },
    {
      to: "/purchases",
      icon: <Package className="h-5 w-5" />,
      tooltip: "Your purchased repos",
    },
    {
      to: "/orders",
      icon: <ShoppingCart className="h-5 w-5" />,
      tooltip: "Your orders",
    },
    {
      to: "/tickets",
      icon: <LineChart className="h-5 w-5" />,
      tooltip: "Tickets",
    },
    {
      to: "/users",
      icon: <Users2 className="h-5 w-5" />,
      tooltip: "User Management",
    },
  ],
  moderator: [
    { to: "/app", icon: <Home className="h-5 w-5" />, tooltip: "Dashboard" },
    {
      to: "/repos",
      icon: <Package className="h-5 w-5" />,
      tooltip: "Your code repos",
    },
    {
      to: "/purchases",
      icon: <Package className="h-5 w-5" />,
      tooltip: "Your purchased repos",
    },
    {
      to: "/tickets",
      icon: <LineChart className="h-5 w-5" />,
      tooltip: "Tickets",
    },
  ],
  seller: [
    { to: "/app", icon: <Home className="h-5 w-5" />, tooltip: "Dashboard" },
    {
      to: "/repos",
      icon: <Package className="h-5 w-5" />,
      tooltip: "Your code repos",
    },
    {
      to: "/purchases",
      icon: <Package className="h-5 w-5" />,
      tooltip: "Your purchased repos",
    },
    {
      to: "/orders",
      icon: <ShoppingCart className="h-5 w-5" />,
      tooltip: "Your orders",
    },
  ],
  buyer: [
    { to: "/app", icon: <Home className="h-5 w-5" />, tooltip: "Dashboard" },
    {
      to: "/repos",
      icon: <Package className="h-5 w-5" />,
      tooltip: "Your code repos",
    },
    {
      to: "/purchases",
      icon: <Package className="h-5 w-5" />,
      tooltip: "Your purchased repos",
    },
  ],
};

export const settingsLink: SidebarLink = {
  to: "/settings/profile",
  icon: <Settings className="h-5 w-5" />,
  tooltip: "Settings",
};
