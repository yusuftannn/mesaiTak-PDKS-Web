import { getActiveSubscriptionByCompany } from "@/features/subscriptions/subscriptions.service";

export type LimitType = "branches" | "users";

type Limits = {
  branches: number | null;
  users: number | null;
};

export async function getCompanyLimits(companyId: string): Promise<Limits> {
  const sub = await getActiveSubscriptionByCompany(companyId);

  if (!sub) {
    return {
      branches: null,
      users: null,
    };
  }

  return {
    branches: sub.branchCount ?? null,
    users: sub.userCount ?? null,
  };
}

export async function assertLimitNotExceeded(
  companyId: string,
  type: LimitType,
  currentCount: number,
): Promise<void> {
  const limits = await getCompanyLimits(companyId);

  const limit = type === "branches" ? limits.branches : limits.users;

  if (limit === null) return;

  if (currentCount >= limit) {
    throw new Error("LIMIT_EXCEEDED");
  }
}
