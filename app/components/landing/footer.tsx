import { Link } from "@remix-run/react";
import { ArrowUpRight } from "lucide-react";
import { ClientOnly } from "remix-utils/client-only";

// import { socialsConfig } from "@/config/socials";
import { cn } from "@/lib/utils";
import { Shell } from "@/components/landing/shell";
// import { ThemeToggle } from "../theme-toggle";
import { BrandName } from "./brand-name";
// import { SocialIconButton } from "./social-icon-button";
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
        <div className="grid grid-cols-2 gap-6 md:grid-cols-5">
          <div className="col-span-2 flex flex-col gap-3">
            <div>
              <BrandName />
              <p className="text-muted-foreground mt-2 text-sm font-light">
                We are on a mission to provide a reliable, easy and fast way to
                monitor the performance of your APIs and websites.
                <br />
                <span className="underline decoration-dotted underline-offset-2">
                  Speed Matters
                </span>
              </p>
            </div>
            {/*<StatusWidgetContainer slug="status" /> */}
            <StatusWidgetContainer />
          </div>
          <div className="order-2 flex flex-col gap-3 text-sm">
            <p className="text-foreground font-semibold">Resources</p>
            <FooterLink href="/blog" label="Blog" />
            <FooterLink href="/pricing" label="Pricing" />
            <FooterLink href="https://docs.openstatus.dev" label="Docs" />
            <FooterLink href="/oss-friends" label="OSS Friends" />
            <FooterLink href="/status" label="External Providers Monitoring" />
          </div>
          <div className="order-3 flex flex-col gap-3 text-sm">
            <p className="text-foreground font-semibold">Company</p>
            <FooterLink href="/about" label="About" />
            <FooterLink href="/changelog" label="Changelog" />
            <FooterLink href="/legal/terms" label="Terms" />
            <FooterLink href="/legal/privacy" label="Privacy" />
          </div>
          <div className="order-3 flex flex-col gap-3 text-sm">
            <p className="text-foreground font-semibold">Tools</p>
            <FooterLink href="/play/checker" label="Speed Checker" />
            <FooterLink href="https://openstat.us" label="All Status Codes" />
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

export function StatusWidgetFallback() {
  return (
    <div className="border-border flex max-w-fit items-center gap-2 rounded-md border px-3 py-1 text-sm">
      <span className="bg-muted h-5 w-20 animate-pulse rounded-md" />
      <span className="bg-muted relative inline-flex h-2 w-2 rounded-full" />
    </div>
  );
}

export function StatusWidgetContainer() {
  return (
    <ClientOnly fallback={<StatusWidgetFallback />}>
      {() => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="max-w-min">Test</div>
            </TooltipTrigger>
            <TooltipContent asChild>
              <Button variant="link" size="sm" asChild>
                <Link target="_blank" to="">
                  Install your own
                </Link>
              </Button>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </ClientOnly>
  );
}
