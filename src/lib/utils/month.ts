export function getMonthRange(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();

  const start = new Date(year, month, 1);
  start.setHours(0, 0, 0, 0);

  const end = new Date(year, month + 1, 0);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

export function getDaysInMonth(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();

  return new Date(year, month + 1, 0).getDate();
}
