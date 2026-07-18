import { DailyCalculation, Shift } from "./types";

type NormalizedLeaveType = DailyCalculation["leaveType"];

function emptyDay(
  isWeekend: boolean,
  isHoliday: boolean,
  leaveType?: NormalizedLeaveType,
): DailyCalculation {
  return {
    expectedMinutes: 0,
    workedMinutes: 0,
    normalMinutes: 0,
    overtimeMinutes: 0,
    missingMinutes: 0,
    expectedWorkDay: false,
    workedDay: false,
    isAbsent: false,
    isWeekend,
    isHoliday,
    leaveType,
  };
}

function getWorkedMinutes(checkIn: Date | null, checkOut: Date | null) {
  if (!checkIn || !checkOut) return 0;
  return Math.max(0, (checkOut.getTime() - checkIn.getTime()) / 1000 / 60);
}

function getShiftMinutes(shift: Shift) {
  const [sh, sm] = shift.start.split(":").map(Number);
  const [eh, em] = shift.end.split(":").map(Number);

  const startMinutes = sh * 60 + sm;
  let endMinutes = eh * 60 + em;

  if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60;
  }

  return Math.max(0, endMinutes - startMinutes - (shift.breakMinutes ?? 0));
}

export function calculateDaily(
  checkIn: Date | null,
  checkOut: Date | null,
  shift: Shift | null,
  isWeekend: boolean,
  isHoliday: boolean,
  leaveType?: NormalizedLeaveType,
): DailyCalculation {
  if (leaveType) {
    return emptyDay(isWeekend, isHoliday, leaveType);
  }

  const worked = getWorkedMinutes(checkIn, checkOut);

  if (!shift) {
    return {
      ...emptyDay(isWeekend, isHoliday),
      workedMinutes: worked,
      overtimeMinutes: worked,
      workedDay: worked > 0,
    };
  }

  const shiftMinutes = getShiftMinutes(shift);
  const expectedWorkDay = shiftMinutes > 0 && !isWeekend && !isHoliday;

  const normal = Math.min(worked, shiftMinutes);

  const overtime = Math.max(0, worked - shiftMinutes);

  const missing = Math.max(0, shiftMinutes - worked);

  return {
    expectedMinutes: expectedWorkDay ? shiftMinutes : 0,
    workedMinutes: worked,
    normalMinutes: normal,
    overtimeMinutes: overtime,
    missingMinutes: expectedWorkDay ? missing : 0,
    expectedWorkDay,
    workedDay: worked > 0,
    isAbsent: expectedWorkDay && worked === 0,
    isWeekend,
    isHoliday,
  };
}
