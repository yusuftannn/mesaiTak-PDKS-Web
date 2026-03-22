import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

import { AttendanceWithLocation } from "@/features/attendance/attendance.types";
import { Leave, LeaveDoc } from "@/features/leaves/leaves.types";
import { MonthlyReport } from "./reports.types";
import { getCompanyId } from "@/lib/utils/company";

function formatDate(date: Date) {
  return date.toISOString().split("T")[0];
}

export async function getMonthlyReport(
  start: Date,
  end: Date,
): Promise<MonthlyReport> {
  const companyId = getCompanyId();

  const startStr = formatDate(start);
  const endStr = formatDate(end);

  const attendanceQuery = query(
    collection(db, "attendance"),

    where("companyId", "==", companyId),

    where("date", ">=", startStr),
    where("date", "<=", endStr),
  );

  const leavesQuery = query(
    collection(db, "leaves"),

    where("companyId", "==", companyId),

    where("startDate", "<=", end),
    where("endDate", ">=", start),
  );

  const [attendanceSnap, leavesSnap] = await Promise.all([
    getDocs(attendanceQuery),
    getDocs(leavesQuery),
  ]);

  const attendance: AttendanceWithLocation[] = attendanceSnap.docs.map(
    (doc) => {
      const data = doc.data();

      return {
        id: doc.id,

        uid: data.uid,
        companyId: data.companyId,

        date: data.date,
        status: data.status,

        checkInAt: data.checkInAt?.toDate?.(),
        checkOutAt: data.checkOutAt?.toDate?.(),

        checkInLocation: data.checkInLocation,
        checkOutLocation: data.checkOutLocation,
      };
    },
  );

  const leaves: Leave[] = leavesSnap.docs.map((doc) => {
    const data = doc.data() as LeaveDoc;

    return {
      id: doc.id,

      userId: data.userId,
      companyId: data.companyId,

      type: data.type,

      startDate: data.startDate.toDate(),
      endDate: data.endDate.toDate(),

      reason: data.reason ?? undefined,

      status: data.status,

      reviewedBy: data.reviewedBy,
      reviewedAt: data.reviewedAt?.toDate(),

      rejectReason: data.rejectReason,

      createdAt: data.createdAt.toDate(),
    };
  });

  return {
    attendance,
    leaves,
  };
}
