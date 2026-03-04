import { holidays2026 } from "@/lib/db/constants/holidays";

export function isHoliday(date: string): boolean {
  return holidays2026.some((h) => h.date === date);
}

export function getHolidayName(date: string): string | null {
  const holiday = holidays2026.find((h) => h.date === date);
  return holiday ? holiday.name : null;
}