import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";

export type Shift = {
  id: string;
  userId: string;
  date: Date;
  startTime: string;
  endTime: string;
  type: string;
};

type ShiftDoc = {
  userId: string;
  date: Timestamp;
  startTime: string;
  endTime: string;
  type: string;
};

export async function listShiftsByDateRange(
  start: Date,
  end: Date,
): Promise<Shift[]> {
  const q = query(
    collection(db, "shifts"),
    where("date", ">=", Timestamp.fromDate(start)),
    where("date", "<=", Timestamp.fromDate(end)),
  );

  const snap = await getDocs(q);

  return snap.docs.map((d) => {
    const data = d.data() as ShiftDoc;

    return {
      id: d.id,
      userId: data.userId,
      date: data.date.toDate(),
      startTime: data.startTime,
      endTime: data.endTime,
      type: data.type,
    };
  });
}
