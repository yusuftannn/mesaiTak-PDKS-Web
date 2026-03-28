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
  updatedAt?: Date | null;
  duration: number | null;
  durationType: PlanDurationType;
}

export type PlanDoc = {
  name: string;
  price: number;
  userLimit: number;
  features: string[];
  createdAt: Timestamp;
  updatedAt?: Timestamp | null;
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

export type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (data: PlanInput) => Promise<void>;
  form: PlanInput;
  setForm: React.Dispatch<React.SetStateAction<PlanInput>>;
};
