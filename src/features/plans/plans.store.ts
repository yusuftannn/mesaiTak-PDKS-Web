import { create } from "zustand";
import { Plan, PlanId } from "./plans.types";
import { listPlans, getPlan } from "./plans.service";

interface PlansState {
  plans: Plan[];
  loading: boolean;
  selectedPlan: Plan | null;

  fetchPlans: () => Promise<void>;
  fetchPlan: (id: PlanId) => Promise<void>;
  clearSelectedPlan: () => void;
}

export const usePlansStore = create<PlansState>((set) => ({
  plans: [],
  loading: false,
  selectedPlan: null,

  fetchPlans: async () => {
    set({ loading: true });

    try {
      const data = await listPlans();
      set({ plans: data, loading: false });
    } catch (e) {
      console.error(e);
      set({ loading: false });
    }
  },

  fetchPlan: async (id) => {
    set({ loading: true });

    try {
      const plan = await getPlan(id);
      set({ selectedPlan: plan, loading: false });
    } catch (e) {
      console.error(e);
      set({ loading: false });
    }
  },

  clearSelectedPlan: () => set({ selectedPlan: null }),
}));
