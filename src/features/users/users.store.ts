import { create } from "zustand";
import { AppUser } from "./users.types";
import { listUsers } from "./users.service";

interface UsersStore {
  users: AppUser[];
  loading: boolean;

  fetchUsers: () => Promise<void>;
}

export const useUsersStore = create<UsersStore>((set) => ({
  users: [],
  loading: false,

  fetchUsers: async () => {
    set({ loading: true });

    const users = await listUsers();

    set({
      users,
      loading: false,
    });
  },
}));
