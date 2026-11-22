"use client";

import { useRef, useState } from "react";
import { Bot, LoaderCircle } from "lucide-react";
import AiWeeklySummaryCard from "./AiWeeklySummaryCard";
import { useAuthStore } from "@/features/auth/auth.store";
import { analyzeAttendance } from "@/features/reports/ai-reports.service";
import type { WeeklyAiReport } from "@/features/reports/ai-reports.types";

export default function ReportsPage() {
  const canAnalyze = useAuthStore((state) =>
    state.user?.role === "admin" && Boolean(state.user.companyId),
  );
  const [report, setReport] = useState<WeeklyAiReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestPending = useRef(false);

  async function handleAnalyze() {
    if (!canAnalyze || requestPending.current) return;

    requestPending.current = true;
    setLoading(true);
    setError(null);
    setReport(null);

    try {
      setReport(await analyzeAttendance());
    } catch (err) {
      const message = err instanceof Error ? err.message : undefined;
      setError(message ?? "Analiz başlatılamadı. Lütfen tekrar deneyin.");
    } finally {
      requestPending.current = false;
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen p-6 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-text-primary">
              Gemini Analizi
            </h1>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              {canAnalyze
                ? "Son tamamlanan haftanın mesai verilerini önceki haftayla karşılaştırın."
                : "Mesai analizini şirket yöneticileri çalıştırabilir."}
            </p>
          </div>
          {canAnalyze && (
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={loading}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-secondary px-4 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
            >
              {loading ? <LoaderCircle size={18} className="animate-spin" /> : <Bot size={18} />}
              <span role="status">{loading ? "Gemini analiz ediyor…" : "Gemini ile Analiz Et"}</span>
            </button>
          )}
        </section>

        {error && (
          <p role="alert" className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </p>
        )}
        {report && <AiWeeklySummaryCard report={report} />}
      </div>
    </main>
  );
}
