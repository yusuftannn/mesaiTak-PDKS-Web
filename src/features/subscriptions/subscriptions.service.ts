import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { Subscription, SubscriptionStatus } from "./subscriptions.types";
import { PlanId } from "../plans/plans.types";

type SubscriptionDoc = {
  companyId: string;
  planId: PlanId;
  status: SubscriptionStatus;
  startDate: Timestamp;
  endDate: Timestamp | null;
  createdAt: Timestamp;
};

function mapSubscription(id: string, data: SubscriptionDoc): Subscription {
  return {
    id,
    companyId: data.companyId,
    planId: data.planId,
    status: data.status,
    startDate: data.startDate.toDate(),
    endDate: data.endDate ? data.endDate.toDate() : null,
    createdAt: data.createdAt.toDate(),
  };
}

export async function getSubscriptionByCompany(
  companyId: string,
): Promise<Subscription | null> {
  const q = query(
    collection(db, "subscriptions"),
    where("companyId", "==", companyId),
  );

  const snap = await getDocs(q);

  if (snap.empty) return null;

  const d = snap.docs[0];
  return mapSubscription(d.id, d.data() as SubscriptionDoc);
}

export async function listSubscriptions(): Promise<Subscription[]> {
  const snap = await getDocs(collection(db, "subscriptions"));

  return snap.docs.map((d) =>
    mapSubscription(d.id, d.data() as SubscriptionDoc),
  );
}

export async function createSubscription(params: {
  companyId: string;
  planId: PlanId;
  startDate?: Date;
  endDate?: Date | null;
  status?: SubscriptionStatus;
}): Promise<void> {
  await addDoc(collection(db, "subscriptions"), {
    companyId: params.companyId,
    planId: params.planId,
    status: params.status ?? "trial",
    startDate: Timestamp.fromDate(params.startDate ?? new Date()),
    endDate: params.endDate ? Timestamp.fromDate(params.endDate) : null,
    createdAt: Timestamp.now(),
  });
}

export async function updateSubscriptionPlan(
  subscriptionId: string,
  planId: PlanId,
): Promise<void> {
  const ref = doc(db, "subscriptions", subscriptionId);

  await updateDoc(ref, {
    planId,
  });
}

export async function updateSubscriptionStatus(
  subscriptionId: string,
  status: SubscriptionStatus,
): Promise<void> {
  const ref = doc(db, "subscriptions", subscriptionId);

  await updateDoc(ref, {
    status,
  });
}
