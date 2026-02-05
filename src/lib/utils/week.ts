export type DayKey =
  | "mon"
  | "tue"
  | "wed"
  | "thu"
  | "fri"
  | "sat"
  | "sun";

export function getWeekRange(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);

  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return { monday, sunday };
}

export function getDayKey(date: Date): DayKey {
  return ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][
    date.getDay()
  ] as DayKey;
}

export function getDateForDayKey(
  monday: Date,
  dayKey: DayKey,
) {
  const map: Record<DayKey, number> = {
    mon: 0,
    tue: 1,
    wed: 2,
    thu: 3,
    fri: 4,
    sat: 5,
    sun: 6,
  };

  const d = new Date(monday);
  d.setDate(monday.getDate() + map[dayKey]);
  d.setHours(0, 0, 0, 0);

  return d;
}
