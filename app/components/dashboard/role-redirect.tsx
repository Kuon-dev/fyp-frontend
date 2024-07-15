import React, { useEffect, useState } from "react";
import { useNavigate } from "@remix-run/react";
import { useUserStore } from "@/stores/user-store";

/**
 * RoleBasedRedirect component
 * Redirects users based on their role or to login if no role is found,
 * with proper handling of the initial loading state
 */
export function RoleBasedRedirect() {
  const navigate = useNavigate();
  const [user, checkLoginStatus] = useUserStore((state) => [
    state.user,
    state.checkLoginStatus,
  ]);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      setIsChecking(true);
      await checkLoginStatus();
      setIsChecking(false);
    };

    checkStatus();
  }, [checkLoginStatus]);

  useEffect(() => {
    if (!isChecking) {
      if (user?.user?.role) {
        // Redirect to the appropriate dashboard based on user role
        navigate(`/app/${user.user.role.toLowerCase()}`, { replace: true });
      } else if (user === null) {
        // Only redirect to login if we're sure there's no user
        navigate("/login", { replace: true });
      }
    }
  }, [user, navigate, isChecking]);

  // Optionally, you can return a loading indicator here
  return isChecking ? <div>Loading...</div> : null;
}

/**
 * withRoleBasedRedirect HOC
 * Wraps a component with the RoleBasedRedirect logic
 */
export function withRoleBasedRedirect<P extends object>(
  WrappedComponent: React.ComponentType<P>,
): React.FC<P> {
  return function WithRoleBasedRedirect(props: P) {
    return (
      <>
        <RoleBasedRedirect />
        <WrappedComponent {...props} />
      </>
    );
  };
}
