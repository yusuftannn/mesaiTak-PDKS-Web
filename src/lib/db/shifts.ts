import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
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

export async function createShift(params: {
  userId: string;
  date: Date;
  startTime: string;
  endTime: string;
}) {
  await addDoc(collection(db, "shifts"), {
    userId: params.userId,
    date: Timestamp.fromDate(params.date),
    startTime: params.startTime,
    endTime: params.endTime,
    type: "normal",
    createdAt: Timestamp.now(),
  });
}

export async function updateShift(
  shiftId: string,
  data: {
    startTime: string;
    endTime: string;
  },
) {
  await updateDoc(doc(db, "shifts", shiftId), {
    ...data,
  });
}
