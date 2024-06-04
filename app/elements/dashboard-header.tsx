// import React, { useEffect, useState } from "react";
// import { Link, Outlet, useLocation } from "@remix-run/react";
// import { Package2, PanelLeft, Search } from "lucide-react";
// import {
//   Breadcrumb,
//   BreadcrumbItem,
//   BreadcrumbLink,
//   BreadcrumbList,
//   BreadcrumbPage,
//   BreadcrumbSeparator,
// } from "@/components/ui/breadcrumb";
// import { Button } from "@/components/ui/button";
// import {
//   DropdownMenu,
//   // DropdownMenuCheckboxItem,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Input } from "@/components/ui/input";
// import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
// import { Skeleton } from "@/components/ui/skeleton";
// // import { TooltipProvider } from "@/components/ui/tooltip";
//
// import { LazyImage } from "@/components/custom/image";
// import { useDashboardStore } from "@/stores/dashboard-store";
// import { sidebarLinks } from "./dashboard-sidebar";
//
// import { ClientOnly } from "remix-utils/client-only";
//
// const Image = LazyImage;
//
// export default function DashboardHeader() {
//   const { user, breadcrumbs, setUser, setBreadcrumbs } = useDashboardStore();
//   const loc = useLocation();
//
//   useEffect(() => {
//     // Fetch user details and set user state
//     const fetchUser = async () => {
//       const userData = await fetchUserDetails(); // Implement fetchUserDetails to fetch user data
//       setUser(userData);
//     };
//
//     fetchUser();
//
//     // Set breadcrumbs based on current route
//     const path = loc.pathname.split("/").filter(Boolean);
//     const currentBreadcrumbs = path.map((p, index) => ({
//       // captialize first letter of path
//       label: p.charAt(0).toUpperCase() + p.slice(1),
//       link: path.slice(1, index + 1).join("/"),
//     }));
//     setBreadcrumbs(currentBreadcrumbs);
//   }, [loc.pathname]);
//
//   return (
//     <ClientOnly fallback={<DashboardHeaderFallback />}>
//       {() => (
//         <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static h-auto sm:bg-transparent sm:px-6 w-full">
//           <Sheet>
//             <SheetTrigger asChild>
//               <Button size="icon" variant="outline" className="sm:hidden">
//                 <PanelLeft className="h-5 w-5" />
//                 <span className="sr-only">Toggle Menu</span>
//               </Button>
//             </SheetTrigger>
//             <SheetContent side="left" className="sm:max-w-xs">
//               <nav className="grid gap-6 text-lg font-medium">
//                 <Link
//                   to="#"
//                   className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
//                 >
//                   <Package2 className="h-5 w-5 transition-all group-hover:scale-110" />
//                   <span className="sr-only">Acme Inc</span>
//                 </Link>
//                 {sidebarLinks.map((link, index) => (
//                   <Link
//                     key={index}
//                     to={link.to}
//                     className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
//                   >
//                     {link.icon}
//                     {link.tooltip}
//                   </Link>
//                 ))}
//               </nav>
//             </SheetContent>
//           </Sheet>
//           <Breadcrumb className="hidden md:flex">
//             <BreadcrumbList>
//               {breadcrumbs.map((breadcrumb, index) => (
//                 <React.Fragment key={index}>
//                   <BreadcrumbItem>
//                     {prependDashboard(breadcrumb.link) !== loc.pathname ? (
//                       <BreadcrumbLink asChild>
//                         <Link to={breadcrumb.link ?? "#"}>
//                           {breadcrumb.label}
//                         </Link>
//                       </BreadcrumbLink>
//                     ) : (
//                       <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
//                     )}
//                   </BreadcrumbItem>
//                   {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
//                 </React.Fragment>
//               ))}
//             </BreadcrumbList>
//           </Breadcrumb>{" "}
//           <div className="relative ml-auto flex-1 md:grow-0">
//             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//             <Input
//               type="search"
//               placeholder="Search..."
//               className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
//             />
//           </div>
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button
//                 variant="outline"
//                 size="icon"
//                 className="overflow-hidden rounded-full"
//               >
//                 {user && (
//                   <Image
//                     src={user.avatar}
//                     width={36}
//                     height={36}
//                     alt="Avatar"
//                     className="overflow-hidden rounded-full"
//                   />
//                 )}
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end">
//               <DropdownMenuLabel>My Account</DropdownMenuLabel>
//               <DropdownMenuSeparator />
//               <DropdownMenuItem>Settings</DropdownMenuItem>
//               <DropdownMenuItem>Support</DropdownMenuItem>
//               <DropdownMenuSeparator />
//               <DropdownMenuItem>Logout</DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </header>
//       )}
//     </ClientOnly>
//   );
// }
//
// function DashboardHeaderFallback() {
//   return (
//     <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static h-auto sm:bg-transparent sm:px-6 w-full">
//       <Button size="icon" variant="outline" className="sm:hidden">
//         <PanelLeft className="h-5 w-5" />
//         <span className="sr-only">Toggle Menu</span>
//       </Button>
//       <Skeleton className="h-4 w-[250px]" />
//       <div className="relative ml-auto flex-1 md:grow-0">
//         <Skeleton className="h-4 w-[250px]" />
//       </div>
//       <Skeleton className="h-12 w-12 rounded-full" />
//     </header>
//   );
// }
//
// async function fetchUserDetails() {
//   return {
//     id: "1",
//     name: "John Doe",
//     email: "john.doe@example.com",
//     avatar: "/placeholder-user.jpg",
//   };
// }
//
// const prependDashboard = (path: string | undefined) => {
//   if (!path) return "/dashboard";
//   const cleanPath = path.startsWith("/") ? path.slice(1) : path;
//   const newPath = `/${cleanPath}`;
//   return newPath;
// };
