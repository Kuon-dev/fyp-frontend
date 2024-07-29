import { Link } from "@remix-run/react";
import { ArrowUpRight } from "lucide-react";
import { ClientOnly } from "remix-utils/client-only";

import { cn } from "@/lib/utils";
import { Shell } from "@/components/landing/shell";
import { BrandName } from "./brand-name";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
  className?: string;
}

export default function Footer({ className }: Props) {
  return (
    <footer className={cn("w-full", className)}>
      <Shell className="grid gap-6">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          <div className="col-span-2 flex flex-col gap-3">
            <div>
              <BrandName />
              <p className="text-muted-foreground mt-2 text-sm font-light">
                Kortex: An innovative e-commerce platform for trading React
                components, ensuring high-quality code through AI-powered
                analysis.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 text-sm">
            <p className="text-foreground font-semibold">Resources</p>
            <FooterLink href="/search" label="Search" />
            <FooterLink href="/support/pricing" label="Pricing" />
            <FooterLink href="/app/user/purchases" label="My Purchases" />
            <FooterLink href="/app/seller/repos" label="My Repositories" />
          </div>
          <div className="flex flex-col gap-3 text-sm">
            <p className="text-foreground font-semibold">Company</p>
            <FooterLink href="/about" label="About" />
            <FooterLink href="/legal/terms" label="Terms of Service" />
            <FooterLink href="/legal/privacy" label="Privacy Policy" />
            <FooterLink href="/support/ticket" label="Support" />
          </div>
        </div>
      </Shell>
    </footer>
  );
}

interface FooterLinkProps {
  href: string;
  label: string;
  external?: boolean;
}

function FooterLink({ href, label, external = false }: FooterLinkProps) {
  const isExternal = external || href.startsWith("http");

  const externalProps = isExternal
    ? {
        target: "_blank",
        rel: "noreferrer",
      }
    : {};

  return (
    <Link
      className="text-muted-foreground hover:text-foreground inline-flex w-fit items-center underline underline-offset-4 hover:no-underline"
      to={href}
      {...externalProps}
    >
      {label}
      {isExternal ? (
        <ArrowUpRight className="ml-1 h-4 w-4 flex-shrink-0" />
      ) : null}
    </Link>
  );
}
