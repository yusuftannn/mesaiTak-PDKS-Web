import { create } from "zustand";
import { listExcuses } from "./excuses.service";
import { Excuse } from "./excuses.types";

interface ExcuseState {
  excuses: Excuse[];
  loading: boolean;

  fetchExcuses: () => Promise<void>;
}

export const useExcuseStore = create<ExcuseState>((set) => ({
  excuses: [],
  loading: false,

  fetchExcuses: async () => {
    set({ loading: true });

    try {
      const data = await listExcuses();
      set({ excuses: data });
    } finally {
      set({ loading: false });
    }
  },
}));
