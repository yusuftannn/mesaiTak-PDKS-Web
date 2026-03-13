import { Timestamp } from "firebase/firestore";
import { ShiftType } from "@/lib/db/constants/shiftTypes";

export type Shift = {
  id: string;
  userId: string;
  date: Date;
  startTime: string;
  endTime: string;
  type: ShiftType;
};

export type ShiftDoc = {
  userId: string;
  date: Timestamp;
  startTime: string;
  endTime: string;
  type: ShiftType;
};

export type CreateShiftParams = {
  userId: string;
  date: Date;
  startTime: string;
  endTime: string;
  type: ShiftType;
};
