import { listAllUsers } from "@/lib/db/users";
import { listAttendanceByDate } from "@/lib/db/attendance";
import { listLeaves } from "@/lib/db/leaves";
import { listShiftsByDateRange } from "@/lib/db/shifts";

import { runPuantajEngine } from "@/lib/puantaj/puantajEngine";

export async function buildMonthlyPuantaj(
  start: Date,
  end: Date
) {

  const users = await listAllUsers();

  const attendance = await listAttendanceByDate(start, end);

  const shifts = await listShiftsByDateRange(start, end);

  const result = [];

  for (const user of users) {

    const userAttendance = attendance.filter(
      (a) => a.uid === user.uid
    );

    const userShifts = shifts.filter(
      (s) => s.userId === user.uid
    );

    const leaves = await listLeaves(user.uid);

    const report = runPuantajEngine(
      userAttendance,
      userShifts,
      leaves
    );

    result.push({
      sicilNo: user.uid,
      name: user.name,
      report,
    });
  }

  return result;
}