import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { calculateDistanceMeters } from "@/lib/utils/distance";
const suspiciousRef = collection(db, "suspicious_logs");

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

export async function checkSuspiciousAndLog(params: {
  userId: string;
  userName: string;
  branchId: string;
  branchName: string;
  userLat: number;
  userLng: number;
  branchLat: number;
  branchLng: number;
}) {
  const companyId = getCompanyId();
  
  const distance = calculateDistanceMeters(
    params.userLat,
    params.userLng,
    params.branchLat,
    params.branchLng,
  );

  const allowedDistance = 200;

  if (distance <= allowedDistance) return;

  const severity = distance > 1000 ? "high" : distance > 500 ? "medium" : "low";

  await addDoc(suspiciousRef, {
    companyId,
    userId: params.userId,
    userName: params.userName,
    branchId: params.branchId,
    branchName: params.branchName,
    distance,
    allowedDistance,
    severity,
    userLat: params.userLat,
    userLng: params.userLng,
    branchLat: params.branchLat,
    branchLng: params.branchLng,
    createdAt: serverTimestamp(),
  });
}
