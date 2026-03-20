import { PlanId } from "../plans/plans.types";

export type Company = {
  id: string;
  companyId: string;

  name: string;
  country: string;

  planId: PlanId | null;
  subscriptionId: string | null;

  createdAt: Date | null;
  updatedAt?: Date | null;
};

export type CompanyDoc = {
  companyId: string;

  name: string;
  country: string;

  planId?: PlanId;
  subscriptionId?: string;

  createdAt?: {
    toDate: () => Date;
  };
  updatedAt?: {
    toDate: () => Date;
  };
};
