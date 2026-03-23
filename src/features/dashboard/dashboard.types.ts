import { Timestamp } from "firebase/firestore";
import { AppUser } from "@/features/users/users.types";

export type AttendanceDoc = {
  status?: "mola" | "çalışıyor" | string;
  uid: string;
  companyId: string;
  date: string;
  checkInAt?: { toDate: () => Date } | null;
  checkOutAt?: { toDate: () => Date } | null;
  breaks?: { end?: { toDate: () => Date } | null }[];
};

export type ShiftDoc = {
  userId: string;
  companyId: string;
  date: Timestamp;
  startTime: string;
  endTime: string;
};

export type DashboardUser = AppUser & {
  shiftStart: string | null;
  shiftEnd: string | null;
};

export type DashboardStats = {
  arrived: { count: number; users: DashboardUser[] };
  late: { count: number; users: DashboardUser[] };
  working: { count: number; users: DashboardUser[] };
  onBreak: { count: number; users: DashboardUser[] };
  absent: { count: number; users: DashboardUser[] };
  earlyLeave: { count: number; users: DashboardUser[] };
};
