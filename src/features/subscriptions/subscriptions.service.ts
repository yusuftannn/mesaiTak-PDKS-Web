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
    (a, b) => b.data().createdAt.toMillis() - a.data().createdAt.toMillis(),
  );

  const d = sorted[0];

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

  const companyRef = doc(db, "companies", params.companyId);

  await updateDoc(companyRef, {
    currentPlanId: params.planId,
    subscriptionStatus: params.status ?? "trial",
    subscriptionEndDate: params.endDate
      ? Timestamp.fromDate(params.endDate)
      : null,
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

export async function deleteSubscription(
  subscriptionId: string,
): Promise<void> {
  if (!subscriptionId) {
    throw new Error("subscriptionId is required");
  }

  const subRef = doc(db, "subscriptions", subscriptionId);
  const subSnap = await getDoc(subRef);

  if (!subSnap.exists()) {
    throw new Error("Subscription not found");
  }

  const subData = subSnap.data() as SubscriptionDoc;
  const companyId = subData.companyId;

  if (!companyId) {
    throw new Error("companyId missing in subscription");
  }

  await deleteDoc(subRef);

  const q = query(
    collection(db, "subscriptions"),
    where("companyId", "==", companyId),
    where("status", "in", ["trial", "active"]),
  );

  const snap = await getDocs(q);

  const companyRef = doc(db, "companies", companyId);

  if (!snap.empty) {
    const sorted = snap.docs.sort(
      (a, b) =>
        (b.data() as SubscriptionDoc).createdAt.toMillis() -
        (a.data() as SubscriptionDoc).createdAt.toMillis(),
    );

    const latest = sorted[0].data() as SubscriptionDoc;

    await updateDoc(companyRef, {
      currentPlanId: latest.planId,
      subscriptionStatus: latest.status,
      subscriptionEndDate: latest.endDate ?? null,
    });
  } else {
    const freePlanQuery = query(
      collection(db, "plans"),
      where("name", "==", "FREE"),
    );

    const freeSnap = await getDocs(freePlanQuery);

    if (freeSnap.empty) {
      throw new Error("FREE plan not found in plans collection");
    }

    const freePlanDoc = freeSnap.docs[0];

    await updateDoc(companyRef, {
      currentPlanId: freePlanDoc.id,
      subscriptionStatus: "expired" as SubscriptionStatus,
      subscriptionEndDate: null,
    });
  }
}
