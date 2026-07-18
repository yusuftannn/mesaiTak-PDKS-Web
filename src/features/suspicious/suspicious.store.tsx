import { create } from "zustand";
import { SuspiciousLog, listSuspiciousLogs } from "./suspicious.service";

type State = {
  logs: SuspiciousLog[];
  loading: boolean;
  fetchLogs: () => Promise<void>;
};

export const useSuspiciousStore = create<State>((set) => ({
  logs: [],
  loading: false,

  fetchLogs: async () => {
    set({ loading: true });

    const logs = await listSuspiciousLogs();

    set({ logs, loading: false });
  },
}));
