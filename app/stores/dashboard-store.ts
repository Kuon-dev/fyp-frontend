import { create } from "zustand";
// import { BreadcrumbItem } from '@/types'; // Define the BreadcrumbItem type

export interface BreadcrumbItem {
  label: string;
  link?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface DashboardStoreState {
  user: User | null;
  breadcrumbs: BreadcrumbItem[];
  setUser: (user: User) => void;
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
}

export const useDashboardStore = create<DashboardStoreState>((set) => ({
  user: null,
  breadcrumbs: [],
  setUser: (user) => set({ user }),
  setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
}));
