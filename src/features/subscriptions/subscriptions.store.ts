import { create } from "zustand";
import { Subscription, SubscriptionStatus } from "./subscriptions.types";
import {
  listSubscriptions,
  getSubscriptionByCompany,
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
    const sub = await getSubscriptionByCompany(companyId);
    set({ currentSubscription: sub, loading: false });
  },
}));
