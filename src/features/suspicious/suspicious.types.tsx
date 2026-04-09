import { Timestamp } from "firebase/firestore";

export interface SuspiciousLog {
  id: string;
  userId: string;
  userName: string;
  branchId: string;
  branchName: string;

  distance: number;
  allowedDistance: number;

  severity: "low" | "medium" | "high";

  userLat: number;
  userLng: number;
  branchLat: number;
  branchLng: number;

  createdAt: Date;
}

export type SuspiciousLogDoc = {
  userId: string;
  userName: string;
  branchId: string;
  branchName: string;

  distance: number;
  allowedDistance: number;

  severity?: "low" | "medium" | "high";

  userLat: number;
  userLng: number;
  branchLat: number;
  branchLng: number;

  createdAt: Timestamp;
};