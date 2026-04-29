import { Timestamp } from "firebase/firestore";

export type ExcuseType = "late" | "early";

export interface ExcuseDoc {
  userId: string;
  type: ExcuseType;
  description: string;
  date: Timestamp;
  createdAt: Timestamp;
  companyId: string;
}

export interface Excuse {
  id: string;
  userId: string;
  type: ExcuseType;
  description: string;
  date: Date;
  createdAt: Date;
}
