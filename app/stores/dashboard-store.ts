import { create } from "zustand";

export type Me = {
  user: Omit<BackendUser, "passwordHash">;
  profile: BackendProfile;
};

// import { BreadcrumbItem } from '@/types'; // Define the BreadcrumbItem type

interface DashboardStoreState {
  user: Me | null;
  setUser: (user: Me) => void;
}

export const useDashboardStore = create<DashboardStoreState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
