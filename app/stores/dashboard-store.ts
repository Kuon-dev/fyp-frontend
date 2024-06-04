import { create } from "zustand";
// import { BreadcrumbItem } from '@/types'; // Define the BreadcrumbItem type

interface DashboardStoreState {
  user: BackendUser | null;
  setUser: (user: BackendUser) => void;
}

export const useDashboardStore = create<DashboardStoreState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
