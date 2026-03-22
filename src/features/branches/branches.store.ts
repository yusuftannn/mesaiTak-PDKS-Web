import { create } from "zustand";
import { Branch } from "./branches.types";
import {
  listBranches,
  createBranch,
  updateBranch,
  removeBranch,
} from "./branches.service";

interface BranchStore {
  branches: Branch[];
  loading: boolean;

  fetchBranches: () => Promise<void>;
  createBranch: (name: string) => Promise<void>;
  updateBranch: (id: string, name: string) => Promise<void>;
  deleteBranch: (id: string) => Promise<void>;
}

export const useBranchesStore = create<BranchStore>((set, get) => ({
  branches: [],
  loading: false,

  fetchBranches: async () => {
    set({ loading: true });

    try {
      const branches = await listBranches();
      set({ branches });
    } catch (e) {
      console.error("fetchBranches error:", e);
      set({ branches: [] });
    } finally {
      set({ loading: false });
    }
  },

  createBranch: async (name) => {
    await createBranch(name);

    await get().fetchBranches();
  },

  updateBranch: async (id, name) => {
    await updateBranch(id, name);

    set((state) => ({
      branches: state.branches.map((b) =>
        b.branchId === id ? { ...b, name } : b,
      ),
    }));
  },

  deleteBranch: async (id) => {
    await removeBranch(id);

    set((state) => ({
      branches: state.branches.filter((b) => b.branchId !== id),
    }));
  },
}));
