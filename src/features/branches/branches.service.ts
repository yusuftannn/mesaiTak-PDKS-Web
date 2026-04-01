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

import { Branch, BranchDoc } from "./branches.types";
import { COLLECTIONS } from "@/constants/collections";
import { getCompanyId } from "@/lib/utils/company";
import { useAuthStore } from "../auth/auth.store";

export async function listBranches(): Promise<Branch[]> {
  const currentUser = useAuthStore.getState().user;

  if (!currentUser) throw new Error("User yok");

  if (currentUser.role === "manager") {
    const snap = await getDocs(collection(db, COLLECTIONS.BRANCHES));

    const items: Branch[] = snap.docs.map((d) => {
      const data = d.data() as BranchDoc;

      return {
        id: d.id,
        branchId: data.branchId ?? d.id,
        name: data.name,
        companyId: data.companyId,
        createdAt: data.createdAt ? data.createdAt.toDate() : null,
        qrValue: data.qrValue ?? "",
      };
    });

    return items.sort((a, b) => {
      const at = a.createdAt ? a.createdAt.getTime() : 0;
      const bt = b.createdAt ? b.createdAt.getTime() : 0;
      return bt - at;
    });
  }

  const companyId = getCompanyId();

  return listBranchesByCompany(companyId);
}

export async function listBranchesByCompany(
  companyId: string,
): Promise<Branch[]> {
  const q = query(
    collection(db, COLLECTIONS.BRANCHES),
    where("companyId", "==", companyId),
  );

  const snap = await getDocs(q);

  const items: Branch[] = snap.docs.map((d) => {
    const data = d.data() as BranchDoc;

    return {
      id: d.id,
      branchId: data.branchId ?? d.id,
      name: data.name,
      companyId: data.companyId,
      createdAt: data.createdAt ? data.createdAt.toDate() : null,
      qrValue: data.qrValue ?? "",
    };
  });

  items.sort((a, b) => {
    const at = a.createdAt ? a.createdAt.getTime() : 0;
    const bt = b.createdAt ? b.createdAt.getTime() : 0;
    return bt - at;
  });

  return items;
}

export async function createBranch(name: string) {
  const companyId = getCompanyId();

  if (!companyId) throw new Error("Company bulunamadı");

  const branchId = uuid();

  const qrValue = `http://localhost:3000/check-in?branchId=${branchId}`;

  await setDoc(doc(db, COLLECTIONS.BRANCHES, branchId), {
    branchId,
    companyId,
    qrValue,
    name,
    createdAt: serverTimestamp(),
  });
}

export async function createBranchByCompany(companyId: string, name: string) {
  const branchId = uuid();

  await setDoc(doc(db, COLLECTIONS.BRANCHES, branchId), {
    branchId,
    companyId,
    name,
    createdAt: serverTimestamp(),
  });
}

export async function updateBranch(branchId: string, name: string) {
  await updateDoc(doc(db, COLLECTIONS.BRANCHES, branchId), {
    name,
  });
}

export async function removeBranch(branchId: string) {
  await deleteDoc(doc(db, COLLECTIONS.BRANCHES, branchId));
}
