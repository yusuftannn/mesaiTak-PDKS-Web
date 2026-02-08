export type LeaveType = "yıllık" | "ücretsiz" | "hasta" | "diğer";

export const LEAVE_TYPES: { value: LeaveType; label: string }[] = [
  { value: "yıllık", label: "Yıllık" },
  { value: "ücretsiz", label: "Ücretsiz" },
  { value: "hasta", label: "Hasta" },
  { value: "diğer", label: "Diğer" },
];
