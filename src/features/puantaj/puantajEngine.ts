import { AttendanceWithLocation } from "@/features/attendance/attendance.types";
import { Shift } from "@/features/shifts/shifts.types";
import { Leave } from "../../features/leaves/leaves.types";
import { calculateDaily } from "./calculateDaily";
import { calculateMonthly } from "./calculateMonthly";
import { isHoliday } from "./holidayService";
import { isWeekend } from "./weekendService";
import { DailyCalculation } from "./types";

type NormalizedLeaveType = DailyCalculation["leaveType"];

function formatDateLocalISO(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function normalizeDay(date: Date) {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

function normalizeLeaveType(type: string): NormalizedLeaveType {
  if (type === "annual" || type === "y\u0131ll\u0131k") return "annual";
  if (type === "unpaid" || type === "\u00fccretsiz") return "unpaid";
  if (type === "report" || type === "hasta") return "report";
  return "other";
}

function isLeaveOnDate(leave: Leave, date: Date) {
  const day = normalizeDay(date).getTime();
  const start = normalizeDay(leave.startDate).getTime();
  const end = normalizeDay(leave.endDate).getTime();

  return day >= start && day <= end;
}

export function runPuantajEngine(
  attendances: AttendanceWithLocation[],
  shifts: Shift[],
  leaves: Leave[],
  start: Date,
  end: Date,
) {
  const attendanceByDate = new Map<string, AttendanceWithLocation>();
  const shiftByDate = new Map<string, Shift>();

  attendances.forEach((attendance) => {
    attendanceByDate.set(attendance.date, attendance);
  });

  shifts.forEach((shift) => {
    shiftByDate.set(formatDateLocalISO(shift.date), shift);
  });

  const approvedLeaves = leaves.filter(
    (leave) => leave.status === "onayland\u0131",
  );

  const days: DailyCalculation[] = [];

  for (
    let date = normalizeDay(start);
    date <= normalizeDay(end);
    date.setDate(date.getDate() + 1)
  ) {
    const currentDate = new Date(date);
    const dateKey = formatDateLocalISO(currentDate);
    const attendance = attendanceByDate.get(dateKey);
    const assignedShift = shiftByDate.get(dateKey);
    const leave = approvedLeaves.find((item) =>
      isLeaveOnDate(item, currentDate),
    );

    const shift =
      assignedShift ??
      (attendance?.shiftStart && attendance.shiftEnd
        ? {
            startTime: attendance.shiftStart,
            endTime: attendance.shiftEnd,
          }
        : null);

    days.push(
      calculateDaily(
        attendance?.checkInAt ?? null,
        attendance?.checkOutAt ?? null,
        shift
          ? {
              start: shift.startTime,
              end: shift.endTime,
              breakMinutes: 60,
            }
          : null,
        isWeekend(currentDate),
        isHoliday(dateKey),
        leave ? normalizeLeaveType(leave.type) : undefined,
      ),
    );
  }

  return calculateMonthly(days);
}
