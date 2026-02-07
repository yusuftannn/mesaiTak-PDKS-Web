export type ShiftType = "normal" | "gece" | "mesai";

export const SHIFT_TYPES: {
  value: ShiftType;
  label: string;
}[] = [
  { value: "normal", label: "Normal" },
  { value: "gece", label: "Gece" },
  { value: "mesai", label: "Mesai" },
];
