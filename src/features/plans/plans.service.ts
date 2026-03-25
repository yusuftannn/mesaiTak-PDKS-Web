import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { Plan, PlanId, PlanDoc } from "./plans.types";

function mapPlanDoc(id: string, data: PlanDoc): Plan {
  return {
    id: id as PlanId,
    name: data.name,
    price: data.price,
    userLimit: data.userLimit,
    features: data.features,
    createdAt: data.createdAt.toDate(),
  };
}

export async function listPlans(): Promise<Plan[]> {
  const snap = await getDocs(collection(db, "plans"));

  return snap.docs.map((d) => mapPlanDoc(d.id, d.data() as PlanDoc));
}

export async function getPlan(planId: PlanId): Promise<Plan | null> {
  const ref = doc(db, "plans", planId);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return mapPlanDoc(snap.id, snap.data() as PlanDoc);
}

export async function upsertPlan(plan: Omit<Plan, "createdAt">): Promise<void> {
  const ref = doc(db, "plans", plan.id);

  await setDoc(ref, {
    name: plan.name,
    price: plan.price,
    userLimit: plan.userLimit,
    features: plan.features,
    createdAt: Timestamp.now(),
  });
}

export async function deletePlan(planId: PlanId): Promise<void> {
  const ref = doc(db, "plans", planId);
  await deleteDoc(ref);
}
