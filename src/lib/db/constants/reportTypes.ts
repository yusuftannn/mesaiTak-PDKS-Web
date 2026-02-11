import { Timestamp } from "firebase/firestore";

export type AttendanceDoc = {
  uid: string;
  date: Timestamp;
  checkInAt?: Timestamp;
  checkOutAt?: Timestamp;
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
