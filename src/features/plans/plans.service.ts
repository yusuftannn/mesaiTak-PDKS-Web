import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { Plan, PlanId, PlanDoc, PlanInput } from "./plans.types";

function mapPlanDoc(id: string, data: PlanDoc): Plan {
  return {
    id: id as PlanId,

    name: data.name,

    pricePerUser: data.pricePerUser,
    pricePerBranch: data.pricePerBranch,

    minUser: data.minUser,
    maxUser: data.maxUser,

    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt ? data.updatedAt.toDate() : null,
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

export async function upsertPlan(data: PlanInput): Promise<PlanId> {
  if (data.id) {
    const ref = doc(db, "plans", data.id);

    await updateDoc(ref, {
      name: data.name,

      pricePerUser: data.pricePerUser,
      pricePerBranch: data.pricePerBranch,

      minUser: data.minUser ?? null,
      maxUser: data.maxUser ?? null,

      updatedAt: serverTimestamp(),
    });

    return data.id;
  }

  const ref = await addDoc(collection(db, "plans"), {
    name: data.name,

    pricePerUser: data.pricePerUser,
    pricePerBranch: data.pricePerBranch,

    minUser: data.minUser ?? null,
    maxUser: data.maxUser ?? null,

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
}

export async function deletePlan(planId: PlanId): Promise<void> {
  const ref = doc(db, "plans", planId);
  await deleteDoc(ref);
}
