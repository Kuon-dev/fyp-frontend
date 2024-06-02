import { create } from "zustand";
// import { BreadcrumbItem } from '@/types'; // Define the BreadcrumbItem type

export interface BreadcrumbItem {
  label: string;
  link?: string;
}

interface User {
  name: string;
  email: string;
  avatar: string;
  role: string;
  emailVerified: boolean;
}

interface DashboardStoreState {
  user: User | null;
  setUser: (user: User) => void;
}

export const useDashboardStore = create<DashboardStoreState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
