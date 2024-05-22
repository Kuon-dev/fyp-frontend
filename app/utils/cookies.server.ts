import { createCookie } from "@remix-run/node";

export const cookieConsent = createCookie("cookie-consent", {
  maxAge: 60 * 60 * 24 * 365, // 1 year
});
