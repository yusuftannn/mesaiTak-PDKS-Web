import { AttendanceWithLocation } from "@/features/attendance/attendance.types";
import { Leave } from "@/features/leaves/leaves.types";
import { AppUser } from "@/features/users/users.types";

export type UserBasic = {
  id: string;
  name: string;
};
export type MonthlyReport = {
  attendance: AttendanceWithLocation[];
  leaves: Leave[];
};

export type DayStatus = {
  label: string;
  className: string;
  workedHours: number;
};

export type GetDayStatusFn = (date: Date, userId: string) => DayStatus;

export type ExportParams = {
  users: AppUser[];
  date: Date;
  getDayStatus: GetDayStatusFn;
};
