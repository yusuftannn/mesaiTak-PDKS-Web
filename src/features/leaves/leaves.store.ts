import { create } from "zustand";
import { Leave } from "./leaves.types";
import { listLeaves } from "./leaves.service";

interface LeavesStore {
  leaves: Leave[];
  loading: boolean;

  fetchLeaves: () => Promise<void>;
}

export const useLeavesStore = create<LeavesStore>((set) => ({
  leaves: [],
  loading: false,

  fetchLeaves: async () => {
    set({ loading: true });

    const leaves = await listLeaves();

    set({
      leaves,
      loading: false,
    });
  },
}));
