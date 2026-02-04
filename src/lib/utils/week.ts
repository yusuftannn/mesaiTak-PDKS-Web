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

export function getDayKey(date: Date) {
  return ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][date.getDay()];
}
