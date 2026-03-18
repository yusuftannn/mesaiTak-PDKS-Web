import { DailyCalculation, MonthlyCalculation } from "./types"

export function calculateMonthly(
  days: DailyCalculation[]
): MonthlyCalculation {

  const result: MonthlyCalculation = {

    totalWorkMinutes: 0,
    normalMinutes: 0,
    overtimeMinutes: 0,
    missingMinutes: 0,

    absentDays: 0,
    weekendDays: 0,
    holidayDays: 0,

    annualLeaveDays: 0,
    reportDays: 0,
    unpaidLeaveDays: 0,
    otherLeaveDays: 0
  }

  days.forEach(day => {

    result.totalWorkMinutes += day.workedMinutes
    result.normalMinutes += day.normalMinutes
    result.overtimeMinutes += day.overtimeMinutes
    result.missingMinutes += day.missingMinutes

    if (day.isAbsent) result.absentDays++
    if (day.isWeekend) result.weekendDays++
    if (day.isHoliday) result.holidayDays++

    if (day.leaveType === "annual") result.annualLeaveDays++
    if (day.leaveType === "report") result.reportDays++
    if (day.leaveType === "unpaid") result.unpaidLeaveDays++
    if (day.leaveType === "other") result.otherLeaveDays++

  })

  return result
}