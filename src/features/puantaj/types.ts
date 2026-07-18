export interface Shift {
  start: string
  end: string
  breakMinutes?: number
}

export interface DailyCalculation {

  expectedMinutes: number

  workedMinutes: number
  normalMinutes: number
  overtimeMinutes: number
  missingMinutes: number

  expectedWorkDay: boolean
  workedDay: boolean
  isAbsent: boolean
  isWeekend: boolean
  isHoliday: boolean

  leaveType?: "annual" | "report" | "unpaid" | "other"
}

export interface MonthlyCalculation {

  expectedWorkMinutes: number
  expectedNormalMinutes: number

  totalWorkMinutes: number
  normalMinutes: number
  overtimeMinutes: number
  missingMinutes: number

  expectedWorkDays: number
  workedDays: number
  absentDays: number
  weekendDays: number
  holidayDays: number

  annualLeaveDays: number
  reportDays: number
  unpaidLeaveDays: number
  otherLeaveDays: number
}
