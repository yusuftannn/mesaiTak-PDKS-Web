import { create } from "zustand";
import { Unsubscribe } from "firebase/firestore";

import { DashboardStats } from "./dashboard.types";
import { subscribeTodayDashboard } from "./dashboard.service";
import { AppUser } from "@/features/users/users.types";

type DashboardStore = {
  stats: DashboardStats | null;
  loading: boolean;

  unsubscribe?: Unsubscribe;

  start: (users: AppUser[]) => Promise<void>;
  stop: () => void;
};

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  stats: null,
  loading: false,
  unsubscribe: undefined,

  start: async (users) => {
    const prev = get().unsubscribe;
    if (prev) prev();

    set({ loading: true });

    const unsub = await subscribeTodayDashboard(users, (stats) => {
      set({ stats, loading: false });
    });

    set({ unsubscribe: unsub });
  },

  stop: () => {
    const unsub = get().unsubscribe;
    if (unsub) unsub();

    set({
      unsubscribe: undefined,
      stats: null,
    });
  },
}));
