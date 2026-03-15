import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

import { AttendanceWithLocation } from "@/features/attendance/attendance.types";
import { LeaveDoc } from "@/features/leaves/leaves.types";
import { MonthlyReport } from "./reports.types";

function formatDate(date: Date) {
  return date.toISOString().split("T")[0];
}

export async function getMonthlyReport(
  start: Date,
  end: Date,
): Promise<MonthlyReport> {
  const startStr = formatDate(start);
  const endStr = formatDate(end);

  const attendanceQuery = query(
    collection(db, "attendance"),
    where("date", ">=", startStr),
    where("date", "<=", endStr),
  );

  const leavesQuery = query(
    collection(db, "leaves"),
    where("startDate", "<=", end),
    where("endDate", ">=", start),
  );

  const [attendanceSnap, leavesSnap] = await Promise.all([
    getDocs(attendanceQuery),
    getDocs(leavesQuery),
  ]);

  const attendance: AttendanceWithLocation[] = attendanceSnap.docs.map(
    (doc) => {
      const data = doc.data() as AttendanceWithLocation;

      return {
        ...data,
        id: doc.id,
      };
    },
  );

  const leaves: LeaveDoc[] = leavesSnap.docs.map((doc) => {
    const data = doc.data() as LeaveDoc;

    return {
      ...data,
      id: doc.id,
    };
  });

  return {
    attendance,
    leaves,
  };
}
