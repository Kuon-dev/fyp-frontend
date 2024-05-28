import Navbar from "@/elements/landing-navbar";
import Footer from "@/components/landing/footer";
import { Shell } from "@/components/landing/shell";
import { Button } from "@/components/ui/button";
import { Link, Outlet } from "@remix-run/react";

export default function Layout() {
  return (
    <>
      <Navbar />
      <div className="w-full bg-black dark:bg-grid-white/[0.1] bg-grid-black/[0.2] pb-20 pt-32">
        <div className="max-w-7xl mx-auto bg-transparent lg:px-0 px-4">
          <Shell>
            <Outlet />
          </Shell>
          <Footer className="pt-10" />
        </div>
      </div>
    </>
  );
}
