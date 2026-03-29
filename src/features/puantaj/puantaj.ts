import { listUsers } from "@/features/users/users.service";
import { listAttendanceByDate } from "@/features/attendance/attendance.service";
import { listLeaves } from "@/features/leaves/leaves.service";
import { listShiftsByDateRange } from "@/features/shifts/shifts.service";

import { runPuantajEngine } from "@/features/puantaj/puantajEngine";

export async function buildMonthlyPuantaj(start: Date, end: Date) {
  const users = await listUsers();

  const attendance = await listAttendanceByDate(start, end);

  const shifts = await listShiftsByDateRange(start, end);

  const allLeaves = await listLeaves();

  const result = [];

  for (const user of users) {
    const userAttendance = attendance.filter((a) => a.uid === user.uid);

    const userShifts = shifts.filter((s) => s.userId === user.uid);

    const userLeaves = allLeaves.filter((l) => l.userId === user.uid);

    const report = runPuantajEngine(userAttendance, userShifts, userLeaves);

    result.push({
      sicilNo: user.uid,
      name: user.name,
      report,
    });
  }

  return result;
}
