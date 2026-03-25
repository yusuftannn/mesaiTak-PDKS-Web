import { Timestamp } from "firebase/firestore";

export type PlanId = string;

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

export type PlanInput = {
  id?: PlanId; 
  name: string;
  price: number;
  userLimit: number;
  features: string[];
};
