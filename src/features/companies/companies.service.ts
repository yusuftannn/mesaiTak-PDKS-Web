import { db } from "@/lib/firebase";

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { v4 as uuid } from "uuid";

import { Company, CompanyDoc } from "./companies.types";
import { COLLECTIONS } from "@/constants/collections";
import { PlanId } from "../plans/plans.types";

function mapCompany(d: CompanyDoc, id: string): Company {
  return {
    id,
    companyId: d.companyId,
    name: d.name,
    country: d.country,

    planId: d.planId ?? null,
    subscriptionId: d.subscriptionId ?? null,

    createdAt: d.createdAt ? d.createdAt.toDate() : null,
    updatedAt: d.updatedAt ? d.updatedAt.toDate() : null,
  };
}

export async function listCompanies(): Promise<Company[]> {
  const q = query(
    collection(db, COLLECTIONS.COMPANIES),
    orderBy("createdAt", "desc"),
  );

  const snap = await getDocs(q);

  return snap.docs.map((d) => mapCompany(d.data() as CompanyDoc, d.id));
}

export async function createCompany(params: {
  name: string;
  country: string;
  planId?: PlanId;
}): Promise<string> {
  const companyId = uuid();

  await setDoc(doc(db, COLLECTIONS.COMPANIES, companyId), {
    companyId,
    name: params.name,
    country: params.country,

    planId: params.planId ?? "FREE",
    subscriptionId: null,

    createdAt: serverTimestamp(),
  });

  return companyId;
}

export async function assignPlanToCompany(
  companyId: string,
  planId: PlanId,
): Promise<void> {
  const ref = doc(db, COLLECTIONS.COMPANIES, companyId);

  await updateDoc(ref, {
    planId,
    updatedAt: serverTimestamp(),
  });
}

export async function updateCompany(
  companyId: string,
  data: {
    name: string;
    country: string;
  },
): Promise<void> {
  const ref = doc(db, COLLECTIONS.COMPANIES, companyId);

  await updateDoc(ref, {
    name: data.name,
    country: data.country,
    updatedAt: serverTimestamp(),
  });
}

export async function removeCompany(companyId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.COMPANIES, companyId));
}
