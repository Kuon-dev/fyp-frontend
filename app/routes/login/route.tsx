import { UserAuthForm } from "@/elements/user-auth-form";
import { codeToHtml } from "shiki";
import { EagerImage } from "@/components/custom/image";
import { useEffect, useRef, useState } from "react";
import { Shell } from "@/components/landing/shell";
import { TYPESCRIPT_VARIANT_5 } from "@/integrations/monaco/constants";
import { Spinner } from "@/components/custom/spinner";

export default function Login() {
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
            <EagerImage
              src="/fyp_logo.png"
              width={150}
              height={40}
            ></EagerImage>
          </div>

          <Shell
            className={
              isLoaded ? "relative m-auto md:p-0" : "border-0 relative m-auto"
            }
          >
            <div
              ref={shikiContainer}
              className={
                isLoaded ? "" : "flex justify-center items-center w-full"
              }
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
            <div className="flex flex-col space-y-2 text-left">
              <h1 className="text-2xl font-semibold tracking-tight">Login</h1>
              <p className="text-sm text-muted-foreground">
                Enter your email and password below <br />
                to log into your account
              </p>
            </div>
            <UserAuthForm />
            <p className="text-sm text-muted-foreground pt-4">
              By clicking login, you agree to our{" "}
              <a
                href="/terms"
                className="underline underline-offset-4 hover:text-primary"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="/privacy"
                className="underline underline-offset-4 hover:text-primary"
              >
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
