import { PlanId } from "../plans/plans.types";

export type SubscriptionStatus = "trial" | "active" | "canceled" | "expired";

export interface Subscription {
  id: string;
  companyId: string;
  planId: PlanId;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date | null;
  createdAt: Date;
}
