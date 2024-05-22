// import * as React from "react";
import { Link } from "@remix-run/react";
import { ClientOnly } from "remix-utils/client-only";

// Hottake: you don't need a features page if you have a changelog page
// Except for SEO
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu";

export function BrandName() {
  return (
    <ClientOnly>
      {() => (
        <ContextMenu>
          <ContextMenuTrigger>
            <Link
              to="/"
              className="font-cal text-muted-foreground hover:text-foreground text-lg"
            >
              OpenStatus
            </Link>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem asChild>
              <a href="/assets/logos/OpenStatus.svg" download="openstatus.svg">
                Download SVG
              </a>
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      )}
    </ClientOnly>
  );
}
