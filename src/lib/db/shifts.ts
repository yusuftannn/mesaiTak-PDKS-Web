import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { ShiftType } from "./constants/shiftTypes";

export type Shift = {
  id: string;
  userId: string;
  date: Date;
  startTime: string;
  endTime: string;
  type: ShiftType;
};

type ShiftDoc = {
  userId: string;
  date: Timestamp;
  startTime: string;
  endTime: string;
  type: ShiftType;
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
  type: ShiftType;
}) {
  await addDoc(collection(db, "shifts"), {
    userId: params.userId,
    date: Timestamp.fromDate(params.date),
    startTime: params.startTime,
    endTime: params.endTime,
    type: params.type,
    createdAt: Timestamp.now(),
  });
}

export async function updateShift(
  shiftId: string,
  data: {
    startTime: string;
    endTime: string;
    type: ShiftType;
  },
) {
  await updateDoc(doc(db, "shifts", shiftId), {
    ...data,
  });
}

export async function removeShift(shiftId: string) {
  await deleteDoc(doc(db, "shifts", shiftId));
}

async function hasShift(userId: string, date: Date) {
  const q = query(
    collection(db, "shifts"),
    where("userId", "==", userId),
    where("date", "==", Timestamp.fromDate(date)),
  );

  const snap = await getDocs(q);
  return !snap.empty;
}

export async function copyWeekShifts(sourceMonday: Date) {
  const sourceSunday = new Date(sourceMonday);
  sourceSunday.setDate(sourceMonday.getDate() + 6);
  sourceSunday.setHours(23, 59, 59, 999);

  const q = query(
    collection(db, "shifts"),
    where("date", ">=", Timestamp.fromDate(sourceMonday)),
    where("date", "<=", Timestamp.fromDate(sourceSunday)),
  );

  const snap = await getDocs(q);

  for (const docSnap of snap.docs) {
    const data = docSnap.data();

    const sourceDate: Date = data.date.toDate();
    const targetDate = new Date(sourceDate);
    targetDate.setDate(sourceDate.getDate() + 7);
    targetDate.setHours(0, 0, 0, 0);

    const exists = await hasShift(data.userId, targetDate);
    if (exists) continue;

    await addDoc(collection(db, "shifts"), {
      userId: data.userId,
      date: Timestamp.fromDate(targetDate),
      startTime: data.startTime,
      endTime: data.endTime,
      type: data.type ?? "normal",
      createdAt: Timestamp.now(),
    });
  }
}
async function deleteTargetShift(userId: string, date: Date) {
  const q = query(
    collection(db, "shifts"),
    where("userId", "==", userId),
    where("date", "==", Timestamp.fromDate(date)),
  );

  const snap = await getDocs(q);

  for (const d of snap.docs) {
    await deleteDoc(doc(db, "shifts", d.id));
  }
}

export async function copyWeekShiftsOverwrite(sourceMonday: Date) {
  const sourceSunday = new Date(sourceMonday);
  sourceSunday.setDate(sourceMonday.getDate() + 6);
  sourceSunday.setHours(23, 59, 59, 999);

  const q = query(
    collection(db, "shifts"),
    where("date", ">=", Timestamp.fromDate(sourceMonday)),
    where("date", "<=", Timestamp.fromDate(sourceSunday)),
  );

  const snap = await getDocs(q);

  for (const docSnap of snap.docs) {
    const data = docSnap.data();

    const sourceDate: Date = data.date.toDate();
    const targetDate = new Date(sourceDate);
    targetDate.setDate(sourceDate.getDate() + 7);
    targetDate.setHours(0, 0, 0, 0);

    await deleteTargetShift(data.userId, targetDate);

    await addDoc(collection(db, "shifts"), {
      userId: data.userId,
      date: Timestamp.fromDate(targetDate),
      startTime: data.startTime,
      endTime: data.endTime,
      type: data.type ?? "normal",
      createdAt: Timestamp.now(),
    });
  }
}
export async function clearWeekShifts(monday: Date) {
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const q = query(
    collection(db, "shifts"),
    where("date", ">=", Timestamp.fromDate(monday)),
    where("date", "<=", Timestamp.fromDate(sunday)),
  );

  const snap = await getDocs(q);

  for (const d of snap.docs) {
    await deleteDoc(doc(db, "shifts", d.id));
  }
}
