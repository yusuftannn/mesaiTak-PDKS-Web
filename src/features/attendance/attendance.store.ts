import { create } from "zustand";
import { AttendanceWithLocation } from "./attendance.types";
import { listAttendanceByDate } from "./attendance.service";

interface AttendanceStore {
  list: AttendanceWithLocation[];
  loading: boolean;

  fetchByDate: (start: Date, end: Date) => Promise<void>;
}

export const useAttendanceStore = create<AttendanceStore>((set) => ({
  list: [],
  loading: false,

  fetchByDate: async (start, end) => {
    set({ loading: true });

    const data = await listAttendanceByDate(start, end);

    set({
      list: data,
      loading: false,
    });
  },
}));
