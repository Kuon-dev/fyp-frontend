import { showErrorToast } from "@/lib/handle-error";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Me = {
  user: Omit<BackendUser, "passwordHash">;
  profile: BackendProfile;
  sellerProfile: BackendSellerProfile | null;
};

interface UserStoreState {
  user: Me | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  setUser: (user: Me | null) => void;
  setLoading: (isLoading: boolean) => void;
  checkLoginStatus: () => Promise<boolean>;
}

export const useUserStore = create<UserStoreState>()(
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
          const response = await fetch(`${window.ENV.BACKEND_URL}/api/v1/me`, {
            credentials: "include",
          });
          if (response.ok) {
            if (response.status === 204)
              throw new Error("session expired, please login again");
            const userData: Me = await response?.json();
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
);
