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

export type Company = {
  id: string;
  companyId: string;
  name: string;
  country: string;
  createdAt: Date | null;
};

type CompanyDoc = {
  companyId: string;
  name: string;
  country: string;
  createdAt?: {
    toDate: () => Date;
  };
};

export async function listCompanies(): Promise<Company[]> {
  const q = query(collection(db, "companies"), orderBy("createdAt", "desc"));

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

  await setDoc(doc(db, "companies", companyId), {
    companyId,
    name,
    country,
    createdAt: serverTimestamp(),
  });
}

export async function updateCompany(
  companyId: string,
  data: { name: string; country: string },
) {
  const ref = doc(db, "companies", companyId);

  await updateDoc(ref, {
    name: data.name,
    country: data.country,
    updatedAt: new Date(),
  });
}

export async function removeCompany(companyId: string) {
  await deleteDoc(doc(db, "companies", companyId));
}
