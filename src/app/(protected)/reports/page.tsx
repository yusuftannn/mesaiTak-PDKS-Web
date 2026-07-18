"use client";

import { useEffect, useState } from "react";
import AiWeeklySummaryCard from "./AiWeeklySummaryCard";
import { subscribeLatestAiReport } from "@/features/reports/ai-reports.service";
import { WeeklyAiReport } from "@/features/reports/ai-reports.types";

export default function ReportsPage() {
  const [report, setReport] = useState<WeeklyAiReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeLatestAiReport({
      onData: (nextReport) => {
        setReport(nextReport);
        setError(null);
        setLoading(false);
      },
      onError: (err) => {
        setError(err.message || "Rapor verisi okunurken beklenmeyen bir hata oluştu.");
        setLoading(false);
      },
    });

    return unsubscribe;
  }, []);

  return (
    <main className="min-h-screen p-6 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight text-text-primary">
            Raporlar
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-text-secondary">
            Haftalık şirket özetleri backend tarafında aggregate edilir, AI yalnızca hazır istatistikleri yorumlar.
          </p>
        </div>

        <AiWeeklySummaryCard report={report} loading={loading} error={error} />
      </div>
    </main>
  );
}
