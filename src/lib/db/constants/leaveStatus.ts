export type LeaveStatus = "beklemede" | "onaylandı" | "reddedildi";

export const LEAVE_STATUS_LABEL: Record<LeaveStatus, string> = {
  beklemede: "Beklemede",
  onaylandı: "Onaylandı",
  reddedildi: "Reddedildi",
};
