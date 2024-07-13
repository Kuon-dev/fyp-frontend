export const unknownError =
  "An unknown error occurred. Please try again later.";

export const redirects = {
  toLogin: "/signin",
  toSignup: "/signup",
  afterLogin: "/app/dashboard/",
  afterLogout: "/",
  toVerify: "/verify-email",
  afterVerify: "/app/dashboard",
} as const;
