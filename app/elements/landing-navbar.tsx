import { Button } from "@/components/ui/button";
import { SheetTrigger, SheetContent, Sheet } from "@/components/ui/sheet";
import { Link } from "@remix-run/react";
import { cn } from "@/lib/utils";
import { useDashboardStore } from "@/stores/dashboard-store";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "#", label: "Products" },
  { to: "/support/ticket", label: "Contact" },
];

export default function Navbar() {
  const user = useDashboardStore((state) => state.user);
  return (
    <section className="flex w-full shrink-0 items-center flex-col">
      <header
        className={cn(
          "backdrop-filter backdrop-blur-lg bg-opacity-30 flex rounded-md w-full items-center flex-grow",
          "fixed top-0 z-50 border-2 border-white/[0.1] ",
          "h-20 px-4 md:px-6 mt-4 mx-2 w-[95%] lg:w-full max-w-4xl",
        )}
      >
        <Sheet>
          <SheetTrigger asChild>
            <Button className="lg:hidden" size="icon" variant="outline">
              <Link to="/">
                <MenuIcon className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Link>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <Link className="flex items-center gap-2" to="/">
              <MountainIcon className="h-6 w-6" />
              <span className="text-lg font-semibold">Kortex</span>
            </Link>
            <div className="grid gap-4 py-6">
              {navLinks.map((link, index) => (
                <Link
                  key={index}
                  className="flex w-full items-center py-2 text-lg font-semibold"
                  to={link.to}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>
        <Link className="mr-20 hidden lg:flex items-center gap-4" to="/">
          <MountainIcon className="h-6 w-6" />
          <span className="text-lg font-semibold">Kortex</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-6 flex-row mx-4">
          {navLinks.map((link, index) => (
            <Link
              key={index}
              className="text-lg font-medium hover:underline underline-offset-4"
              to={link.to}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <Button variant="outline">
              <Link to="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              {" "}
              <Button variant="outline">
                <Link to="/login">Login</Link>
              </Button>
              <Button>
                <Link to="/register">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </header>
    </section>
  );
}

function MenuIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}

function MountainIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
    </svg>
  );
}
