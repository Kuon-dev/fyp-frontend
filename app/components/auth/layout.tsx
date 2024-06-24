import { Link } from "@remix-run/react";
import { ClientOnly } from "remix-utils/client-only";
import { EagerImage } from "@/components/custom/image";
import { Spinner } from "@/components/custom/spinner";
import { Shell } from "@/components/landing/shell";
import { TYPESCRIPT_VARIANT_5 } from "@/integrations/monaco/constants";
import { useRef, useState, useEffect } from "react";
import { codeToHtml } from "shiki";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const shikiContainer = useRef<HTMLDivElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const initShiki = async () => {
    try {
      const html = await codeToHtml(TYPESCRIPT_VARIANT_5, {
        lang: "tsx",
        theme: "vitesse-dark",
      });
      if (shikiContainer.current) {
        shikiContainer.current.innerHTML = html;
        setIsLoaded(true);
      }
    } catch (error) {
      console.error("Error generating code HTML:", error);
    }
  };
  useEffect(() => {
    initShiki();
  }, []);

  return (
    <>
      <div className="container relative grid h-svh flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
          <div className="absolute inset-0 bg-zinc-900" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <Link to="/">
              <EagerImage
                src="/fyp_logo.png"
                width={150}
                height={40}
              ></EagerImage>
            </Link>
          </div>

          <Shell
            className={
              isLoaded ? "relative m-auto md:p-0" : "border-0 relative m-auto"
            }
          >
            <div
              ref={shikiContainer}
              className={isLoaded ? "" : "flex justify-center items-center"}
            >
              <Spinner />
            </div>
          </Shell>

          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                &ldquo;This library has saved me countless hours of work and
                helped me deliver stunning designs to my clients faster than
                ever before.&rdquo;
              </p>
              <footer className="text-sm">Sofia Davis</footer>
            </blockquote>
          </div>
        </div>

        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-2 sm:w-[350px]">
            <ClientOnly>{() => <>{children}</>}</ClientOnly>
          </div>
        </div>
      </div>
    </>
  );
}
