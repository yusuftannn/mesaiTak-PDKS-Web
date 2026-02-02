import { create } from "zustand";

export type Role = "employee" | "admin" | "manager";

export type AuthUserDoc = {
  uid: string;
  email: string | null;
  name?: string | null;
  role: Role;
  companyId?: string | null;
  branchId?: string | null;
};

type AuthState = {
  user: AuthUserDoc | null;
  initializing: boolean;
  setUser: (u: AuthUserDoc | null) => void;
  setInitializing: (v: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  initializing: true,
  setUser: (u) => set({ user: u }),
  setInitializing: (v) => set({ initializing: v }),
}));
