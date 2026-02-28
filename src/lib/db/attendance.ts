import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

export type AttendanceWithLocation = {
  id: string;
  uid: string;
  userName?: string;

  date: string;
  status: string;

  checkInAt?: Date;
  checkOutAt?: Date;

  checkInLocation?: {
    lat: number;
    lng: number;
    accuracy?: number;
  };

  checkOutLocation?: {
    lat: number;
    lng: number;
    accuracy?: number;
  };
};

export async function listAttendanceByDate(
  date: string,
): Promise<AttendanceWithLocation[]> {
  const q = query(
    collection(db, "attendance"),
    where("date", "==", date),
  );

  const snap = await getDocs(q);

  return snap.docs.map((docSnap) => {
    const data = docSnap.data();

    return {
      id: docSnap.id,
      uid: data.uid,
      date: data.date,
      status: data.status,

      checkInAt: data.checkInAt?.toDate?.(),
      checkOutAt: data.checkOutAt?.toDate?.(),

      checkInLocation: data.checkInLocation,
      checkOutLocation: data.checkOutLocation,
    };
  });
}