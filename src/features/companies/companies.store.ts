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

const COLLECTION = "companies";

export async function listCompanies(): Promise<Company[]> {
  const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));

  const snap = await getDocs(q);

  return snap.docs.map((d) => {
    const data = d.data() as CompanyDoc;

    return {
      id: d.id,
      companyId: data.companyId,
      name: data.name,
      country: data.country,
      createdAt: data.createdAt ? data.createdAt.toDate() : null,
    };
  });
}

export async function createCompany(name: string, country: string) {
  const companyId = uuid();

  await setDoc(doc(db, COLLECTION, companyId), {
    companyId,
    name,
    country,

    createdAt: serverTimestamp(),
  });
}

export async function updateCompany(
  companyId: string,
  data: {
    name: string;
    country: string;
  },
) {
  const ref = doc(db, COLLECTION, companyId);

  await updateDoc(ref, {
    name: data.name,
    country: data.country,

    updatedAt: new Date(),
  });
}

export async function removeCompany(companyId: string) {
  await deleteDoc(doc(db, COLLECTION, companyId));
}
