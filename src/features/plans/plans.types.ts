import { Timestamp } from "firebase/firestore";

export type PlanId = string;

export interface Plan {
  id: PlanId;

  name: string;

  pricePerUser: number;
  pricePerBranch: number;

  minUser?: number;
  maxUser?: number;

  createdAt: Date;
  updatedAt?: Date | null;
}

export type PlanDoc = {
  name: string;

  pricePerUser: number;
  pricePerBranch: number;

  minUser?: number;
  maxUser?: number;

  createdAt: Timestamp;
  updatedAt?: Timestamp | null;
};

export type PlanInput = {
  id?: PlanId;

  name: string;

  pricePerUser: number;
  pricePerBranch: number;

  minUser?: number;
  maxUser?: number;
};

export type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (data: PlanInput) => Promise<void>;
  form: PlanInput;
  setForm: React.Dispatch<React.SetStateAction<PlanInput>>;
};
