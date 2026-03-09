import { create } from "zustand";
import { Branch } from "./branches.types";
import { listBranchesByCompany } from "./branches.service";

interface BranchStore {
  branches: Branch[];
  loading: boolean;

  fetchByCompany: (companyId: string) => Promise<void>;
}

export const useBranchesStore = create<BranchStore>((set) => ({
  branches: [],
  loading: false,

  fetchByCompany: async (companyId) => {
    set({ loading: true });

    const branches = await listBranchesByCompany(companyId);

    set({
      branches,
      loading: false,
    });
  },
}));
