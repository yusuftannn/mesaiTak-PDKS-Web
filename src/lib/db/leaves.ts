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
import { LeaveType } from "./constants/leaveTypes";
import { LeaveStatus } from "./constants/leaveStatus";

export type Leave = {
  id: string;
  userId: string;

  type: LeaveType;
  startDate: Date;
  endDate: Date;

  reason?: string;

  status: LeaveStatus;

  reviewedBy?: string;
  reviewedAt?: Date;
  rejectReason?: string;

  createdAt: Date;
};

type LeaveDoc = {
  userId: string;
  type: LeaveType;
  startDate: Timestamp;
  endDate: Timestamp;
  reason?: string;
  status: LeaveStatus;
  reviewedBy?: string;
  reviewedAt?: Timestamp;
  rejectReason?: string;
  createdAt: Timestamp;
};

export async function listLeaves(): Promise<Leave[]> {
  const snap = await getDocs(collection(db, "leaves"));

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

export async function createLeave(data: {
  userId: string;
  type: LeaveType;
  startDate: Date;
  endDate: Date;
  reason?: string;
}) {
  await addDoc(collection(db, "leaves"), {
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
  await updateDoc(doc(db, "leaves", leaveId), {
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
  await updateDoc(doc(db, "leaves", leaveId), {
    status: "reddedildi",
    reviewedBy: reviewerId,
    reviewedAt: serverTimestamp(),
    rejectReason: reason,
  });
}

export async function deleteLeave(leaveId: string) {
  await deleteDoc(doc(db, "leaves", leaveId));
}
