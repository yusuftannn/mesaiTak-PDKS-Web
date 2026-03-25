import { Timestamp } from "firebase/firestore";

export type PlanId = "FREE" | "PRO" | "ENTERPRISE";

export interface Plan {
  id: PlanId;
  name: string;
  price: number;
  userLimit: number;
  features: string[];
  createdAt: Date;
}

export type PlanDoc = {
  name: string;
  price: number;
  userLimit: number;
  features: string[];
  createdAt: Timestamp;
};
