import { create } from "zustand";
import { Subscription } from "./subscriptions.types";
import {
  listSubscriptions,
  getActiveSubscriptionByCompany,
} from "./subscriptions.service";

interface SubscriptionsState {
  subscriptions: Subscription[];
  currentSubscription: Subscription | null;
  loading: boolean;

  fetchSubscriptions: () => Promise<void>;
  fetchCompanySubscription: (companyId: string) => Promise<void>;
}

export const useSubscriptionsStore = create<SubscriptionsState>((set) => ({
  subscriptions: [],
  currentSubscription: null,
  loading: false,

  fetchSubscriptions: async () => {
    set({ loading: true });
    const data = await listSubscriptions();
    set({ subscriptions: data, loading: false });
  },

  fetchCompanySubscription: async (companyId) => {
    set({ loading: true });
    const sub = await getActiveSubscriptionByCompany(companyId);
    set({ currentSubscription: sub, loading: false });
  },
}));
