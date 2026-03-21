import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

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
