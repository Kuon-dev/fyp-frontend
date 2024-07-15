import type { Me } from "@/stores/dashboard-store";
import { json } from "@remix-run/node";

type Role = "ADMIN" | "MODERATOR" | "SELLER" | "USER";
type RequiredRole = Role | Role[];

export const validateUserRole = async (
  request: Request,
  requiredRole: RequiredRole,
): Promise<boolean> => {
  try {
    // Get the auth cookie from the request
    const authCookie = request.headers.get("Cookie");

    if (!authCookie) {
      return false; // No auth cookie present
    }

    // Make a request to your AdonisJS backend to validate the session and get the user's role
    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/me`, {
      headers: {
        Cookie: authCookie,
      },
    });

    if (!response.ok) {
      return false; // Invalid session or other error
    }

    const userData: Me = await response.json();

    const userRole = userData.user.role;
    const roleHierarchy: Role[] = ["ADMIN", "MODERATOR", "SELLER", "USER"];

    if (Array.isArray(requiredRole)) {
      // Check if user's role is in the list of required roles
      return requiredRole.includes(userRole);
    } else {
      // Check if user's role is at least as high as the required role
      const userRoleIndex = roleHierarchy.indexOf(userRole);
      const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);
      return userRoleIndex !== -1 && userRoleIndex <= requiredRoleIndex;
    }
  } catch (error) {
    console.error("Error validating user role:", error);
    return false; // Any error results in failed validation
  }
};

// Helper function to check auth cookie (your existing function)
export const checkAuthCookie = (request: Request) => {
  const cookie = request.headers.get("Cookie");
  const access_cookie = cookie
    ?.split(";")
    .find((c) => c.trim().startsWith("auth_session="));
  return access_cookie ? true : false;
};

// Combined function for auth and role validation
export const validateAuth = async (
  request: Request,
  requiredRole: RequiredRole,
): Promise<boolean> => {
  if (!checkAuthCookie(request)) {
    return false;
  }
  return validateUserRole(request, requiredRole);
};

// Utility function to create a JSON response for unauthorized access
export const unauthorized = () => {
  return json({ message: "Unauthorized" }, { status: 403 });
};
