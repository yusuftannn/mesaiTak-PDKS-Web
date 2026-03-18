import { DailyCalculation, Shift } from "./types";

export function calculateDaily(
  checkIn: Date | null,
  checkOut: Date | null,
  shift: Shift | null,
  isWeekend: boolean,
  isHoliday: boolean,
  leaveType?: string,
): DailyCalculation {
  if (leaveType) {
    return {
      workedMinutes: 0,
      normalMinutes: 0,
      overtimeMinutes: 0,
      missingMinutes: 0,
      isAbsent: false,
      isWeekend,
      isHoliday,
      leaveType,
    };
  }

  if (!shift) {
    return {
      workedMinutes: 0,
      normalMinutes: 0,
      overtimeMinutes: 0,
      missingMinutes: 0,
      isAbsent: false,
      isWeekend,
      isHoliday,
      leaveType,
    };
  }

  if (!checkIn || !checkOut) {
    return {
      workedMinutes: 0,
      normalMinutes: 0,
      overtimeMinutes: 0,
      missingMinutes: 0,
      isAbsent: true,
      isWeekend,
      isHoliday,
    };
  }

  const worked = (checkOut.getTime() - checkIn.getTime()) / 1000 / 60;

  const [sh, sm] = shift.start.split(":").map(Number);
  const [eh, em] = shift.end.split(":").map(Number);

  const shiftMinutes =
    eh * 60 + em - (sh * 60 + sm) - (shift.breakMinutes ?? 0);

  const normal = Math.min(worked, shiftMinutes);

  const overtime = Math.max(0, worked - shiftMinutes);

  const missing = Math.max(0, shiftMinutes - worked);

  return {
    workedMinutes: worked,
    normalMinutes: normal,
    overtimeMinutes: overtime,
    missingMinutes: missing,
    isAbsent: false,
    isWeekend,
    isHoliday,
  };
}
