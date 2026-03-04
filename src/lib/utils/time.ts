export function minutesToTime(minutes: number): string {

  if (!minutes) return "00:00";

  const totalMinutes = Math.round(minutes);

  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  return `${hours.toString().padStart(2,"0")}:${mins
    .toString()
    .padStart(2,"0")}`;
}