import { Timestamp } from "firebase/firestore";

export type AttendanceDoc = {
  id: string;
  uid: string;
  companyId: string;
  branchId: string;
  date: string;
  shiftStart?: string;
  shiftEnd?: string;
  checkInAt?: Timestamp;
  checkOutAt?: Timestamp;
  totalMinutes?: number;
  overtimeMinutes?: number;
  status: string;
};

export type LeaveDoc = {
  userId: string;
  startDate: Timestamp;
  endDate: Timestamp;
  type: "yıllık" | "ücretsiz" | "hasta" | "diğer";
  status: "bekliyor" | "onaylandı" | "reddedildi";
};

export type UserBasic = {
  id: string;
  name: string;
};
