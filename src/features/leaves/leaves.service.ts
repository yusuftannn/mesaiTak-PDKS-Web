import { db } from "@/lib/firebase";

import {
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

export async function listLeaves(): Promise<Leave[]> {
  const snap = await getDocs(collection(db, COLLECTIONS.LEAVES));

  return snap.docs.map((d) => {
    const data = d.data() as LeaveDoc;

    return {
      id: d.id,
      userId: data.userId,

      type: data.type,

      startDate: data.startDate.toDate(),
      endDate: data.endDate.toDate(),

      reason: data.reason,

      status: data.status,

      reviewedBy: data.reviewedBy,
      reviewedAt: data.reviewedAt?.toDate(),

      rejectReason: data.rejectReason,

      createdAt: data.createdAt.toDate(),
    };
  });
}

export async function createLeave(data: CreateLeaveParams) {
  await addDoc(collection(db, COLLECTIONS.LEAVES), {
    userId: data.userId,

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
