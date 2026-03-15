import { AttendanceWithLocation } from "@/features/attendance/attendance.types";
import { LeaveDoc } from "@/features/leaves/leaves.types";

export type UserBasic = {
  id: string;
  name: string;
};
export type MonthlyReport = {
  attendance: AttendanceWithLocation[];
  leaves: LeaveDoc[];
};
