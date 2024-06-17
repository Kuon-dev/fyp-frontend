import { getErrorMessage } from "@/lib/handle-error";
import { LoaderFunction, json } from "@remix-run/node";

export const loader: LoaderFunction = async ({ request }) => {
  const cookieHeader = request.headers.get("Cookie");
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const res = await fetch(`${process.env.BACKEND_URL}/api/v1/verify-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader ?? "",
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

  return json({
    message: "Email verification successful",
  });
};
