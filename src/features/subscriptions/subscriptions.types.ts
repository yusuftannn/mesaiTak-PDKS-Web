import { PlanId } from "../plans/plans.types";
import { Timestamp } from "firebase/firestore";

export type SubscriptionStatus = "trial" | "active" | "canceled" | "expired";
export type BillingPeriod = "monthly" | "yearly";

export interface Subscription {
  planName?: string;
  id: string;
  companyId: string;

  planId: PlanId;

  userCount: number;
  branchCount: number;

  billingPeriod: BillingPeriod;

  status: SubscriptionStatus;

  startDate: Date;
  endDate: Date | null;

  createdAt: Date;
}

export type SubscriptionDoc = {
  billingPeriod: BillingPeriod;
  companyId: string;

  planId: PlanId;

  userCount: number;
  branchCount: number;

  status: SubscriptionStatus;

  startDate: Timestamp;
  endDate: Timestamp | null;

  createdAt: Timestamp;
};

export type FormState = {
  companyId: string;
  planId: PlanId;

  userCount: number;
  branchCount: number;

  status: SubscriptionStatus;
};

export type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    companyId: string;
    planId: PlanId;
    userCount: number;
    branchCount: number;
    billingPeriod: "monthly" | "yearly";
    status: SubscriptionStatus;
  }) => Promise<void>;
  editing?: Subscription | null;
};
