import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";

type BreakItem = {
  end?: {
    toDate: () => Date;
  } | null;
};

type AttendanceDoc = {
  uid: string;
  date: string;
  shiftStart: string;
  shiftEnd: string;
  checkInAt?: {
    toDate: () => Date;
  } | null;
  checkOutAt?: {
    toDate: () => Date;
  } | null;
  breaks?: BreakItem[];
};

export type DashboardStats = {
  arrived: number;
  late: number;
  working: number;
  onBreak: number;
  absent: number;
  earlyLeave: number;
};

function todayString(): string {
  return new Date().toISOString().split("T")[0];
}

function parseShiftTime(time: string): Date {
  const [h, m] = time.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

export function subscribeTodayDashboard(
  totalUsersWithShift: number,
  onChange: (stats: DashboardStats) => void,
) {
  const today = todayString();

  const q = query(collection(db, "attendance"), where("date", "==", today));

  return onSnapshot(q, (snap) => {
    let arrived = 0;
    let late = 0;
    let working = 0;
    let onBreak = 0;
    let earlyLeave = 0;

    snap.docs.forEach((doc) => {
      const a = doc.data() as AttendanceDoc;

      const checkIn = a.checkInAt?.toDate();
      const checkOut = a.checkOutAt?.toDate();

      const shiftStart = parseShiftTime(a.shiftStart);
      const shiftEnd = parseShiftTime(a.shiftEnd);

      if (checkIn) {
        arrived++;
        if (checkIn > shiftStart) late++;
      }

      const activeBreak =
        Array.isArray(a.breaks) && a.breaks.some((b) => !b.end);

      if (checkIn && !checkOut) {
        if (activeBreak) onBreak++;
        else working++;
      }

      if (checkOut && checkOut < shiftEnd) {
        earlyLeave++;
      }
    });

    const absent = Math.max(totalUsersWithShift - snap.size, 0);

    onChange({
      arrived,
      late,
      working,
      onBreak,
      absent,
      earlyLeave,
    });
  });
}
