import { AttendanceWithLocation } from "@/../src/lib/db/attendance";
import { Shift } from "@/../src/lib/db/shifts";
import { Leave } from "@/../src/lib/db/leaves";

import { calculateDaily } from "./calculateDaily";
import { calculateMonthly } from "./calculateMonthly";
import { isHoliday } from "./holidayService";
import { isWeekend } from "./weekendService";

export function runPuantajEngine(
  attendances: AttendanceWithLocation[],
  shifts: Shift[],
  leaves: Leave[],
) {
  const days = attendances.map((a) => {
    const date = new Date(a.date);

    const shift = shifts.find(
      (s) =>
        s.userId === a.uid && s.date.toDateString() === date.toDateString(),
    );

    const leave = leaves.find((l) => {
      return date >= l.startDate && date <= l.endDate;
    });

    return calculateDaily(
      a.checkInAt ?? null,
      a.checkOutAt ?? null,
      shift
        ? {
            start: shift.startTime,
            end: shift.endTime,
            breakMinutes: 60,
          }
        : null,
      isWeekend(date),
      isHoliday(a.date),
      leave?.type,
    );
  });

  return calculateMonthly(days);
}
