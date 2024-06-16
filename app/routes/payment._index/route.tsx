import { LinksFunction } from "@remix-run/node";
import { Links } from "@remix-run/react";
import { useEffect } from "react";

export const links: LinksFunction = () => [
  // { rel: "modulepreload", href: "https://app.lemonsqueezy.com/js/lemon.js", crossOrigin: "anonymous" },
];

export default function Page() {
  // useEffect(() => {
  // })

  return (
    <>
      <Links />
      <div>test</div>
      <a className="lemonsqueezy-button" href="/payment">
        Buy My Amazing Product
      </a>
    </>
  );
}
