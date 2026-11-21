"use client";

import { AlertTriangle, Bot, CalendarDays, Clock3, TimerReset, UserX } from "lucide-react";
import type { WeeklyAiReport } from "@/features/reports/ai-reports.types";

const periodFormatter = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export default function AiWeeklySummaryCard({ report }: { report: WeeklyAiReport }) {
  const period = periodFormatter.formatRange(new Date(report.start), new Date(report.end));
  const stats = report.stats;
  const summaryLines = report.summary
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/70 bg-white p-6 shadow-[0_28px_80px_-46px_rgba(15,23,42,0.55)]">
      <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,var(--palette-primary),var(--palette-secondary),var(--palette-accent))]" />

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-white shadow-[0_18px_42px_-24px_rgba(15,23,42,0.9)]">
            <Bot size={23} />
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-text-primary">
              Gemini Analiz Özeti
            </h2>
            <div className="mt-1 flex items-center gap-2 text-xs font-medium text-text-secondary">
              <CalendarDays size={14} />
              <span>{period}</span>
            </div>
          </div>
        </div>

      </div>

      <div className="mt-6 rounded-2xl border border-border/80 bg-gray-50/70 p-5">
        <div className="space-y-3 text-sm leading-6 text-text-primary">
          {summaryLines.map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
      </div>

      {report.riskAnalysis && (
        <div className="mt-4 flex gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm leading-6 text-red-700">
          <AlertTriangle className="mt-0.5 shrink-0" size={18} />
          <div>
            <div className="font-semibold">Dikkat Edilecek Noktalar</div>
            <p className="mt-1">{report.riskAnalysis}</p>
          </div>
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MiniStat icon={Clock3} label="Geç kalma" value={stats.lateCount} />
        <MiniStat icon={UserX} label="Tahmini devamsızlık" value={stats.absentCount} />
        <MiniStat icon={TimerReset} label="Fazla mesai" value={`${stats.overtimeHours} sa`} />
        <MiniStat icon={CalendarDays} label="Tahmini devam oranı" value={`%${stats.weeklyAttendanceRate}`} />
      </div>
    </section>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-border bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-medium text-text-secondary">
        <Icon size={15} />
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-text-primary">
        {value}
      </div>
    </div>
  );
}
