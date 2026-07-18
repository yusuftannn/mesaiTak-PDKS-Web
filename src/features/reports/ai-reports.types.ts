export type WeeklyAiReportStats = {
  companyName: string;
  totalEmployees: number;
  activeEmployees: number;
  lateCount: number;
  absentCount: number;
  overtimeHours: number;
  mostLateDay: string | null;
  topBranch: string | null;
  repeatedLateEmployees: string[];
  weeklyAttendanceRate: number;
  previousWeekComparison: "up" | "down" | "flat";
  lateIncreasePercent: number;
  overtimeIncreasePercent: number;
};

export type WeeklyAiReport = {
  id: string;
  weekId: string;
  summary: string;
  riskAnalysis?: string;
  stats: WeeklyAiReportStats;
  createdAt: Date | null;
};
