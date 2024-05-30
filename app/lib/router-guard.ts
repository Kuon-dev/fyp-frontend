export const checkAuthCookie = (request: Request) => {
  const cookie = request.headers.get("Cookie");
  const access_cookie = cookie
    ?.split(";")
    .find((c) => c.trim().startsWith("auth_session="));

  return access_cookie ? true : false;
};
