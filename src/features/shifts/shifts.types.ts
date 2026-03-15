import { Timestamp } from "firebase/firestore";

export type ShiftType = "normal" | "gece" | "mesai";

export const SHIFT_TYPES: {
  value: ShiftType;
  label: string;
}[] = [
  { value: "normal", label: "Normal" },
  { value: "gece", label: "Gece" },
  { value: "mesai", label: "Mesai" },
];

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
