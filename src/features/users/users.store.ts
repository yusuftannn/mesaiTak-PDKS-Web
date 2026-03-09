import { create } from "zustand";
import { AppUser } from "./users.types";
import { listUsersByCompany } from "./users.service";

interface UsersStore {
  users: AppUser[];
  loading: boolean;

  fetchByCompany: (companyId: string) => Promise<void>;
}

export const useUsersStore = create<UsersStore>((set) => ({
  users: [],
  loading: false,

  fetchByCompany: async (companyId) => {
    set({ loading: true });

    const users = await listUsersByCompany(companyId);

    set({
      users,
      loading: false,
    });
  },
}));
