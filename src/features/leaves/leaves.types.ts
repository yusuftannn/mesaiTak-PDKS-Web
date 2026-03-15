import { Timestamp } from "firebase/firestore";

export type LeaveType = "yıllık" | "ücretsiz" | "hasta" | "diğer";
export type LeaveStatus = "beklemede" | "onaylandı" | "reddedildi";

export const LEAVE_TYPES: { value: LeaveType; label: string }[] = [
  { value: "yıllık", label: "Yıllık" },
  { value: "ücretsiz", label: "Ücretsiz" },
  { value: "hasta", label: "Hasta" },
  { value: "diğer", label: "Diğer" },
];

export const LEAVE_STATUS_LABEL: Record<LeaveStatus, string> = {
  beklemede: "Beklemede",
  onaylandı: "Onaylandı",
  reddedildi: "Reddedildi",
};

export type Leave = {
  id: string;
  userId: string;

  type: LeaveType;
  startDate: Date;
  endDate: Date;

  reason?: string;

  status: LeaveStatus;

  reviewedBy?: string;
  reviewedAt?: Date;
  rejectReason?: string;

  createdAt: Date;
};

export type LeaveDoc = {
  userId: string;
  type: LeaveType;
  startDate: Timestamp;
  endDate: Timestamp;

  reason?: string;

  status: LeaveStatus;

  reviewedBy?: string;
  reviewedAt?: Timestamp;
  rejectReason?: string;

  createdAt: Timestamp;
};

export type CreateLeaveParams = {
  userId: string;
  type: LeaveType;
  startDate: Date;
  endDate: Date;
  reason?: string;
};
