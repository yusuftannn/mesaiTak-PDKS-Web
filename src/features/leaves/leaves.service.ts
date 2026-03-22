import { db } from "@/lib/firebase";

import {
  query,
  where,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

import { Leave, LeaveDoc, CreateLeaveParams } from "./leaves.types";
import { COLLECTIONS } from "@/constants/collections";
import { getCompanyId } from "@/lib/utils/company";

export async function listLeaves(): Promise<Leave[]> {
  const companyId = getCompanyId();

  const q = query(
    collection(db, COLLECTIONS.LEAVES),
    where("companyId", "==", companyId),
  );

  const snap = await getDocs(q);

  return snap.docs.map((d) => {
    const data = d.data() as LeaveDoc;

    return {
      id: d.id,

      userId: data.userId,
      companyId: data.companyId,

      type: data.type,

      startDate: data.startDate.toDate(),
      endDate: data.endDate.toDate(),

      reason: data.reason ?? undefined,

      status: data.status,

      reviewedBy: data.reviewedBy,
      reviewedAt: data.reviewedAt?.toDate(),

      rejectReason: data.rejectReason,

      createdAt: data.createdAt.toDate(),
    };
  });
}

export async function createLeave(data: CreateLeaveParams) {
  const companyId = getCompanyId();

  await addDoc(collection(db, COLLECTIONS.LEAVES), {
    userId: data.userId,
    companyId,

    type: data.type,

    startDate: Timestamp.fromDate(data.startDate),
    endDate: Timestamp.fromDate(data.endDate),

    reason: data.reason ?? null,

    status: "beklemede",

    createdAt: serverTimestamp(),
  });
}

export async function approveLeave(leaveId: string, reviewerId: string) {
  await updateDoc(doc(db, COLLECTIONS.LEAVES, leaveId), {
    status: "onaylandı",

    reviewedBy: reviewerId,
    reviewedAt: serverTimestamp(),
  });
}

export async function rejectLeave(
  leaveId: string,
  reviewerId: string,
  reason: string,
) {
  await updateDoc(doc(db, COLLECTIONS.LEAVES, leaveId), {
    status: "reddedildi",

    reviewedBy: reviewerId,
    reviewedAt: serverTimestamp(),

    rejectReason: reason,
  });
}

export async function deleteLeave(leaveId: string) {
  await deleteDoc(doc(db, COLLECTIONS.LEAVES, leaveId));
}
