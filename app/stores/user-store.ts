import { showErrorToast } from "@/lib/handle-error";
import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { toast } from "sonner";

// Define the types based on the expected JSON response
type Role = "ADMIN" | "MODERATOR" | "SELLER" | "USER";

interface MeUser {
  id: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  bannedUntil: string | null;
  role: Role;
}

interface MeProfile {
  id: string;
  profileImg: string | null;
  name: string | null;
  phoneNumber: string | null;
  userId: string;
}

export interface Me {
  user: MeUser;
  profile: MeProfile;
  sellerProfile: BackendSellerProfile;
}

interface UserStoreState {
  user: Me | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  setUser: (user: Me | null) => void;
  setLoading: (isLoading: boolean) => void;
  checkLoginStatus: () => Promise<boolean>;
}

export const useUserStore = create<UserStoreState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        isLoading: false,
        isLoggedIn: false,
        setUser: (user) => set({ user, isLoggedIn: !!user }),
        setLoading: (isLoading) => set({ isLoading }),
        checkLoginStatus: async () => {
          const { setLoading, setUser } = get();
          setLoading(true);
          try {
            const response = await fetch(
              `${window.ENV.BACKEND_URL}/api/v1/me`,
              {
                credentials: "include",
              },
            );
            if (response.ok) {
              if (response.status === 204) {
                toast("Session expired, please login again", {
                  action: {
                    label: "Login",
                    onClick: () => {
                      window.location.href = "/login";
                    },
                  },
                });
                setUser(null);
                return false;
              }
              const userData: Me = await response.json();
              setUser(userData);
              return true;
            } else {
              setUser(null);
              return false;
            }
          } catch (error) {
            showErrorToast(error);
            console.error("Error checking login status:", error);
            setUser(null);
            return false;
          } finally {
            setLoading(false);
          }
        },
      }),
      {
        name: "user-store",
        partialize: (state) => ({
          user: state.user,
          isLoggedIn: state.isLoggedIn,
        }),
      },
    ),
  ),
);
