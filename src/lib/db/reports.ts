import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { AttendanceDoc, LeaveDoc } from "./constants/reportTypes";

export async function getMonthlyReport(
  start: Date,
  end: Date,
): Promise<{
  attendance: AttendanceDoc[];
  leaves: LeaveDoc[];
}> {
  const attendanceSnap = await getDocs(
    query(
      collection(db, "attendance"),
      where("date", ">=", start),
      where("date", "<=", end),
    ),
  );

  const leavesSnap = await getDocs(
    query(
      collection(db, "leaves"),
      where("startDate", "<=", end),
      where("endDate", ">=", start),
    ),
  );

  return {
    attendance: attendanceSnap.docs.map(
      (d) => d.data() as AttendanceDoc,
    ),
    leaves: leavesSnap.docs.map(
      (d) => d.data() as LeaveDoc,
    ),
  };
}
