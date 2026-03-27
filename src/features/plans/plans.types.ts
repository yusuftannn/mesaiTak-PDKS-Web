import { Timestamp } from "firebase/firestore";

export type PlanId = string;
export type PlanDurationType = "days" | "months" | "years" | "unlimited";

export interface Plan {
  id: PlanId;
  name: string;
  price: number;
  userLimit: number;
  features: string[];
  createdAt: Date;
    duration: number | null;
  durationType: PlanDurationType;
}

export type PlanDoc = {
  name: string;
  price: number;
  userLimit: number;
  features: string[];
  createdAt: Timestamp;
    duration: number | null;
  durationType: PlanDurationType;
};

export type PlanInput = {
  id?: PlanId; 
  name: string;
  price: number;
  userLimit: number;
  features: string[];
    duration: number | null;
  durationType: PlanDurationType;
};
