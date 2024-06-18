import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { Link, Outlet } from "@remix-run/react";

export default function Layout() {
  return (
    <>
      <Navbar />
      <div className="w-full bg-black dark:bg-grid-white/[0.1] bg-grid-black/[0.2] pb-20 pt-32">
        <div className="md:max-w-4xl mx-auto bg-transparent max-w-2xl lg:px-0 px-4">
          <Button className="" variant="link">
            <Link to="/">&larr; Back to Home</Link>
          </Button>
          <div className="mt-5">
            <Outlet />
          </div>
          <Footer className="pt-10" />
        </div>
      </div>
    </>
  );
}
