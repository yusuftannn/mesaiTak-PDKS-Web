import { db } from "@/lib/firebase";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { v4 as uuid } from "uuid";

export type Branch = {
  id: string;
  branchId: string;
  name: string;
  companyId: string;
  createdAt: Date | null;
};

type BranchDoc = {
  branchId?: string;
  name: string;
  companyId: string;
  createdAt?: {
    toDate: () => Date;
  };
};

export async function listBranchesByCompany(
  companyId: string,
): Promise<Branch[]> {
  const q = query(
    collection(db, "branches"),
    where("companyId", "==", companyId),
  );

  const snap = await getDocs(q);

  const items = snap.docs.map((d) => {
    const data = d.data() as BranchDoc;

    return {
      id: d.id,
      branchId: data.branchId ?? d.id,
      name: data.name,
      companyId: data.companyId,
      createdAt: data.createdAt ? data.createdAt.toDate() : null,
    };
  });

  items.sort((a, b) => {
    const at = a.createdAt ? a.createdAt.getTime() : 0;
    const bt = b.createdAt ? b.createdAt.getTime() : 0;
    return bt - at;
  });

  return items;
}

export async function createBranch(companyId: string, name: string) {
  const branchId = uuid();

  await setDoc(doc(db, "branches", branchId), {
    branchId,
    companyId,
    name,
    createdAt: serverTimestamp(),
  });
}

export async function updateBranch(branchId: string, name: string) {
  await updateDoc(doc(db, "branches", branchId), { name });
}

export async function removeBranch(branchId: string) {
  await deleteDoc(doc(db, "branches", branchId));
}
