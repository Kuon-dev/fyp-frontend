import { create } from "zustand";

export type Me = {
  user: Omit<BackendUser, "passwordHash">;
  profile: BackendProfile;
};

interface UserStoreState {
  user: Me | null;
  isLoading: boolean;
  setUser: (user: Me) => void;
  setLoading: (isLoading: boolean) => void;
  fetchUser: () => Promise<void>;
}

export const useUserStore = create<UserStoreState>((set, get) => ({
  user: null,
  isLoading: false,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  fetchUser: async () => {
    const { setLoading, setUser } = get();
    setLoading(true);
    try {
      const response = await fetch(`${window.ENV.BACKEND_URL}/api/v1/me`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }
      const userData: Me = await response.json();
      setUser(userData);
    } catch (error) {
      console.error("Error fetching user data:", error);
      // Optionally, you could set an error state here
    } finally {
      setLoading(false);
    }
  },
}));
