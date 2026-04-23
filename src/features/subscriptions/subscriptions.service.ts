import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  addDoc,
  updateDoc,
  query,
  where,
  Timestamp,
  getDoc,
} from "firebase/firestore";

import {
  Subscription,
  SubscriptionStatus,
  SubscriptionDoc,
  BillingPeriod,
} from "./subscriptions.types";

import { PlanId, Plan } from "../plans/plans.types";


function mapSubscription(id: string, data: SubscriptionDoc): Subscription {
  return {
    id,
    companyId: data.companyId,
    planId: data.planId,

    userCount: data.userCount,
    branchCount: data.branchCount,

    billingPeriod: data.billingPeriod,

    status: data.status,

    startDate: data.startDate.toDate(),
    endDate: data.endDate ? data.endDate.toDate() : null,
    createdAt: data.createdAt.toDate(),
  };
}


function calculateEndDate(startDate: Date, period: BillingPeriod): Date {
  const d = new Date(startDate);

  if (period === "monthly") {
    d.setMonth(d.getMonth() + 1);
  }

  if (period === "yearly") {
    d.setFullYear(d.getFullYear() + 1);
  }

  return d;
}


export async function listSubscriptions(): Promise<Subscription[]> {
  const snap = await getDocs(collection(db, "subscriptions"));

  return snap.docs.map((d) =>
    mapSubscription(d.id, d.data() as SubscriptionDoc),
  );
}


export async function getActiveSubscriptionByCompany(
  companyId: string,
): Promise<Subscription | null> {
  const q = query(
    collection(db, "subscriptions"),
    where("companyId", "==", companyId),
    where("status", "in", ["trial", "active"]),
  );

  const snap = await getDocs(q);

  if (snap.empty) return null;

  const sorted = snap.docs.sort(
    (a, b) =>
      (b.data() as SubscriptionDoc).createdAt.toMillis() -
      (a.data() as SubscriptionDoc).createdAt.toMillis(),
  );

  const d = sorted[0];
  const sub = mapSubscription(d.id, d.data() as SubscriptionDoc);

  try {
    const planRef = doc(db, "plans", sub.planId);
    const planSnap = await getDoc(planRef);

    if (planSnap.exists()) {
      const planData = planSnap.data() as Plan;
      sub.planName = planData.name;
    }
  } catch (err) {
    console.error("Plan fetch error:", err);
  }

  return sub;
}

export async function createSubscription(params: {
  companyId: string;
  planId: PlanId;

  userCount: number;
  branchCount: number;

  billingPeriod: BillingPeriod;

  status?: SubscriptionStatus;
}): Promise<void> {
  const startDate = new Date();
  const endDate = calculateEndDate(startDate, params.billingPeriod);

  await addDoc(collection(db, "subscriptions"), {
    companyId: params.companyId,
    planId: params.planId,

    userCount: params.userCount,
    branchCount: params.branchCount,

    billingPeriod: params.billingPeriod,

    status: params.status ?? "trial",

    startDate: Timestamp.fromDate(startDate),
    endDate: Timestamp.fromDate(endDate),

    createdAt: Timestamp.now(),
  });

  const companyRef = doc(db, "companies", params.companyId);

  await updateDoc(companyRef, {
    currentPlanId: params.planId,
    subscriptionStatus: params.status ?? "trial",
    subscriptionEndDate: Timestamp.fromDate(endDate),
  });
}

export async function updateSubscription(
  subscriptionId: string,
  params: {
    planId: PlanId;
    userCount: number;
    branchCount: number;
    billingPeriod: BillingPeriod;
    status: SubscriptionStatus;
  },
): Promise<void> {
  const ref = doc(db, "subscriptions", subscriptionId);

  const startDateSnap = await getDoc(ref);

  if (!startDateSnap.exists()) {
    throw new Error("Subscription not found");
  }

  const currentData = startDateSnap.data() as SubscriptionDoc;

  const startDate = currentData.startDate.toDate();
  const newEndDate = calculateEndDate(startDate, params.billingPeriod);

  await updateDoc(ref, {
    planId: params.planId,
    userCount: params.userCount,
    branchCount: params.branchCount,
    billingPeriod: params.billingPeriod,
    status: params.status,
    endDate: Timestamp.fromDate(newEndDate),
  });
}

export async function deleteSubscription(
  subscriptionId: string,
): Promise<void> {
  if (!subscriptionId) throw new Error("subscriptionId is required");

  const ref = doc(db, "subscriptions", subscriptionId);
  await deleteDoc(ref);
}
