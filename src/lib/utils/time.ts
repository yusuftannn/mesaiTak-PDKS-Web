import { BillingPeriod } from "@/features/subscriptions/subscriptions.types";

export function minutesToTime(minutes: number): string {

  if (!minutes) return "00:00";

  const totalMinutes = Math.round(minutes);

  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  return `${hours.toString().padStart(2,"0")}:${mins
    .toString()
    .padStart(2,"0")}`;
}

export function calculateEndDate(
  startDate: Date,
  period: BillingPeriod
): Date {
  const d = new Date(startDate);

  if (period === "monthly") {
    d.setMonth(d.getMonth() + 1);
  }

  if (period === "yearly") {
    d.setFullYear(d.getFullYear() + 1);
  }

  return d;
}