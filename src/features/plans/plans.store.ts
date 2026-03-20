import { create } from "zustand";
import { Plan, PlanId } from "./plans.types";
import { listPlans, getPlan } from "./plans.service";

interface PlansState {
  plans: Plan[];
  loading: boolean;
  selectedPlan: Plan | null;

  fetchPlans: () => Promise<void>;
  fetchPlan: (id: PlanId) => Promise<void>;
}

export const usePlansStore = create<PlansState>((set) => ({
  plans: [],
  loading: false,
  selectedPlan: null,

  fetchPlans: async () => {
    set({ loading: true });
    const data = await listPlans();
    set({ plans: data, loading: false });
  },

  fetchPlan: async (id) => {
    set({ loading: true });
    const plan = await getPlan(id);
    set({ selectedPlan: plan, loading: false });
  },
}));
