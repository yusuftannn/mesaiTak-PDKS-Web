import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { getDistanceMeters } from "@/lib/utils/distance";
const suspiciousRef = collection(db, "suspicious_logs");

const MAX_DISTANCE = 200;

import { AttendanceWithLocation, AttendanceDoc } from "./attendance.types";
import { COLLECTIONS } from "@/constants/collections";
import { getCompanyId } from "@/lib/utils/company";

export async function listAttendanceByDate(
  start: Date,
  end: Date,
): Promise<AttendanceWithLocation[]> {
  const companyId = getCompanyId();

  const q = query(
    collection(db, COLLECTIONS.ATTENDANCE),

    where("companyId", "==", companyId),

    where("date", ">=", start.toISOString().slice(0, 10)),
    where("date", "<=", end.toISOString().slice(0, 10)),
  );

  const snap = await getDocs(q);

  return snap.docs.map((docSnap) => {
    const data = docSnap.data() as AttendanceDoc;

    return {
      id: docSnap.id,

      uid: data.uid,
      companyId: data.companyId,

      date: data.date,
      status: data.status,

      checkInAt: data.checkInAt?.toDate(),
      checkOutAt: data.checkOutAt?.toDate(),

      checkInLocation: data.checkInLocation,
      checkOutLocation: data.checkOutLocation,
    };
  });
}

export async function checkSuspiciousCheckIn(params: {
  userId: string;
  userName: string;
  branchId: string;
  branchName: string;
  userLat: number;
  userLng: number;
  branchLat: number;
  branchLng: number;
}) {
  const distance = getDistanceMeters(
    params.userLat,
    params.userLng,
    params.branchLat,
    params.branchLng,
  );

  if (distance <= MAX_DISTANCE) return;

  const today = new Date().toISOString().slice(0, 10);
  const companyId = getCompanyId();
  const q = query(
    suspiciousRef,
    where("userId", "==", params.userId),
    where("date", "==", today),
    where("companyId", "==", companyId),
  );

  const existing = await getDocs(q);

  if (!existing.empty) return;

  await addDoc(suspiciousRef, {
    userId: params.userId,
    userName: params.userName,
    branchId: params.branchId,
    branchName: params.branchName,
    distance,
    allowedDistance: MAX_DISTANCE,
    userLat: params.userLat,
    userLng: params.userLng,
    branchLat: params.branchLat,
    branchLng: params.branchLng,
    date: today,
    createdAt: serverTimestamp(),
  });
}
