import { create } from "zustand";

export type Role = "employee" | "admin" | "manager";
export type UserStatus = "active" | "passive";

export type AuthUserDoc = {
  uid: string;
  email: string | null;
  name?: string | null;
  role: Role;
  companyId?: string | null;
  branchId?: string | null;
  status: UserStatus;
};

export type AuthError = "unauthorized" | null;

type AuthState = {
  user: AuthUserDoc | null;
  initializing: boolean;
  authError: AuthError;

  setUser: (u: AuthUserDoc | null) => void;
  setInitializing: (v: boolean) => void;
  setAuthError: (e: AuthError) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  initializing: true,
  authError: null,

  setUser: (u) => set({ user: u }),
  setInitializing: (v) => set({ initializing: v }),
  setAuthError: (e) => set({ authError: e }),
}));
