export interface AttendanceRecord {
  date: string
  checkIn?: Date
  checkOut?: Date
}

export interface Shift {
  start: string
  end: string
  breakMinutes?: number
}

export interface LeaveRecord {
  date: string
  type: "annual" | "report" | "unpaid" | "other"
}

export interface DailyCalculation {

  workedMinutes: number
  normalMinutes: number
  overtimeMinutes: number
  missingMinutes: number

  isAbsent: boolean
  isWeekend: boolean
  isHoliday: boolean

  leaveType?: string
}

export interface MonthlyCalculation {

  totalWorkMinutes: number
  normalMinutes: number
  overtimeMinutes: number
  missingMinutes: number

  absentDays: number
  weekendDays: number
  holidayDays: number

  annualLeaveDays: number
  reportDays: number
  unpaidLeaveDays: number
  otherLeaveDays: number
}