import { PlanId } from "../plans/plans.types";

export type SubscriptionStatus = "trial" | "active" | "canceled" | "expired";

export interface Subscription {
  id: string;
  companyId: string;
  planId: PlanId;
  planName?: string;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date | null;
  createdAt: Date;
}

export type FormState = {
  companyId: string;
  planId: PlanId;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
};

export type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    companyId: string;
    planId: PlanId;
    status: SubscriptionStatus;
    startDate: Date;
    endDate: Date | null;
  }) => Promise<void>;
  editing?: Subscription | null;
};
