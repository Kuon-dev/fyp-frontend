import Navbar from "@/elements/landing-navbar";
// import { Outlet } from "@remix-run/react";
import Footer from "@/components/landing/footer";
import { Shell } from "@/components/landing/shell";
import { Button } from "@/components/ui/button";
import { Link, Outlet } from "@remix-run/react";
import { Separator } from "@/components/ui/separator";

export default function Layout() {
  return (
    <>
      <Navbar />
      <div className="w-full bg-black dark:bg-grid-white/[0.1] bg-grid-black/[0.2] pb-20 pt-32">
        <div className="md:max-w-4xl mx-auto bg-transparent max-w-2xl lg:px-0 px-4">
          <Button className="" variant="link">
            <Link to="/">&larr; Back to Home</Link>
          </Button>
          <div className="flex flex-row p-2 border-border border rounded-lg bg-gray-800/50 items-center text-sm h-full">
            <Link
              to="/support/ticket"
              className="text-gray-500 dark:text-gray-400 underline"
            >
              <Button className="mr-2" variant="link">
                Submit a ticket
              </Button>
            </Link>
            <Separator orientation="vertical" className="bg-white h-5" />
            <Link
              to="/support/pricing"
              className="text-gray-500 dark:text-gray-400 underline"
            >
              <Button className="mr-2" variant="link">
                Pricing
              </Button>
            </Link>
            <Separator orientation="vertical" />
          </div>
          <div className="mt-5">
            <Outlet />
          </div>
          <Footer className="pt-10" />
        </div>
      </div>
    </>
  );
}
