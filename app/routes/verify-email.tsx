import { getErrorMessage } from "@/lib/handle-error";
import { LoaderFunction, json, redirect } from "@remix-run/node";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const token = url.searchParams.get("auth_session") ?? "";
  const cookieHeader = request.headers.get("Cookie");
  console.log(token);

  // const cookieHeader = request.headers.get("Cookie");
  try {
    const res = await fetch(`${process.env.BACKEND_URL}/api/v1/verify-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader ?? token,
      },
      body: JSON.stringify({
        code,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message);
    }
    // success data
    /* {
     *  "message": "Email verification successful"
     * }
     */
  } catch (e) {
    const errorMessage = getErrorMessage(e);
    return json(
      {
        message: errorMessage,
      },
      {
        status: 400,
      },
    );
  }
  return redirect("/app", {
    headers: {
      "Set-Cookie": token ?? "",
    },
  });
};
