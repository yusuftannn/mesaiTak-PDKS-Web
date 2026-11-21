export type WeeklyAiReport = {
  start: string;
  end: string;
  summary: string;
  riskAnalysis: string;
  stats: {
    lateCount: number;
    absentCount: number;
    overtimeHours: number;
    weeklyAttendanceRate: number;
  };
};
