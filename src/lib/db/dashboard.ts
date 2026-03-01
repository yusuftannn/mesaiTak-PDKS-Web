import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  Timestamp,
  getDocs,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";
import type { AppUser } from "@/lib/db/users";

type AttendanceDoc = {
  uid: string;
  date: string; 
  checkInAt?: { toDate: () => Date } | null;
  checkOutAt?: { toDate: () => Date } | null;
  breaks?: { end?: { toDate: () => Date } | null }[];
};

type ShiftDoc = {
  userId: string;
  date: Timestamp;
  startTime: string;
  endTime: string;
};

export type DashboardUser = AppUser & {
  shiftStart: string | null;
  shiftEnd: string | null;
};

export type DashboardStats = {
  arrived: { count: number; users: DashboardUser[] };
  late: { count: number; users: DashboardUser[] };
  working: { count: number; users: DashboardUser[] };
  onBreak: { count: number; users: DashboardUser[] };
  absent: { count: number; users: DashboardUser[] };
  earlyLeave: { count: number; users: DashboardUser[] };
};

function todayString(): string {
  return new Date().toISOString().split("T")[0];
}

function getDayRange(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

export async function subscribeTodayDashboard(
  users: AppUser[],
  onChange: (stats: DashboardStats) => void,
): Promise<Unsubscribe> {
  const today = new Date();
  const todayKey = todayString();
  const { start, end } = getDayRange(today);

  const shiftQuery = query(
    collection(db, "shifts"),
    where("date", ">=", Timestamp.fromDate(start)),
    where("date", "<=", Timestamp.fromDate(end)),
  );

  const shiftSnap = await getDocs(shiftQuery);

  const shiftMap = new Map<string, ShiftDoc>();

  shiftSnap.docs.forEach((doc) => {
    const data = doc.data() as ShiftDoc;
    shiftMap.set(data.userId, data);
  });

  const attendanceQuery = query(
    collection(db, "attendance"),
    where("date", "==", todayKey),
  );

  return onSnapshot(attendanceQuery, (snap) => {
    const arrived: DashboardUser[] = [];
    const late: DashboardUser[] = [];
    const working: DashboardUser[] = [];
    const onBreak: DashboardUser[] = [];
    const earlyLeave: DashboardUser[] = [];

    const presentSet = new Set<string>();

    snap.docs.forEach((doc) => {
      const a = doc.data() as AttendanceDoc;
      const user = users.find((u) => u.uid === a.uid);
      if (!user) return;

      presentSet.add(user.uid);

      const shift = shiftMap.get(user.uid);

      const enriched: DashboardUser = {
        ...user,
        shiftStart: shift?.startTime ?? null,
        shiftEnd: shift?.endTime ?? null,
      };

      const checkIn = a.checkInAt?.toDate() ?? null;
      const checkOut = a.checkOutAt?.toDate() ?? null;

      if (checkIn) {
        arrived.push(enriched);

        if (shift?.startTime) {
          const [h, m] = shift.startTime.split(":").map(Number);
          const shiftStart = new Date();
          shiftStart.setHours(h, m, 0, 0);

          if (checkIn > shiftStart) {
            late.push(enriched);
          }
        }
      }

      const activeBreak =
        Array.isArray(a.breaks) && a.breaks.some((b) => !b.end);

      if (checkIn && !checkOut) {
        if (activeBreak) onBreak.push(enriched);
        else working.push(enriched);
      }

      if (checkOut && shift?.endTime) {
        const [h, m] = shift.endTime.split(":").map(Number);
        const shiftEnd = new Date();
        shiftEnd.setHours(h, m, 0, 0);

        if (checkOut < shiftEnd) {
          earlyLeave.push(enriched);
        }
      }
    });

    const absent: DashboardUser[] = users
      .filter((u) => !presentSet.has(u.uid))
      .map((u) => {
        const shift = shiftMap.get(u.uid);
        return {
          ...u,
          shiftStart: shift?.startTime ?? null,
          shiftEnd: shift?.endTime ?? null,
        };
      });

    onChange({
      arrived: { count: arrived.length, users: arrived },
      late: { count: late.length, users: late },
      working: { count: working.length, users: working },
      onBreak: { count: onBreak.length, users: onBreak },
      absent: { count: absent.length, users: absent },
      earlyLeave: { count: earlyLeave.length, users: earlyLeave },
    });
  });
}
