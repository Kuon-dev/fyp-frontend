import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

installGlobals();

export default defineConfig({
  plugins: [remix(), tsconfigPaths()],
  ssr: {
    noExternal: [
      "@radix-ui/react-dialog",
      // "@radix-ui/react-tooltip",
      "@radix-ui/react-menubar",
      "@radix-ui/react-menu",
      "@radix-ui/react-popover",
      "@radix-ui/react-slot",
      "@radix-ui/react-dropdown-menu",
    ],
  },
});
