import { Home, LineChart, Package, ShoppingCart, Users2 } from "lucide-react";

export const adminSidebarLinks = [
  {
    to: "/app",
    icon: <Home className="h-5 w-5" />,
    tooltip: "Dashboard",
  },
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
  }, // seller only
  {
    to: "/tickets",
    icon: <LineChart className="h-5 w-5" />,
    tooltip: "Tickets",
  },
];

export const moderatorSidebarLinks = [
  {
    to: "/app",
    icon: <Home className="h-5 w-5" />,
    tooltip: "Dashboard",
  },
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
];

export const sellerSidebarLinks = [
  {
    to: "/app",
    icon: <Home className="h-5 w-5" />,
    tooltip: "Dashboard",
  },
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
];

export const buyerSidebarLinks = [
  {
    to: "/app",
    icon: <Home className="h-5 w-5" />,
    tooltip: "Dashboard",
  },
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
];
