import { auth } from "@/lib/firebase";
import type { WeeklyAiReport } from "./ai-reports.types";

const fallbackMessage = "Analiz başlatılamadı. Lütfen tekrar deneyin.";

export async function analyzeAttendance(): Promise<WeeklyAiReport> {
  const user = auth.currentUser;
  if (!user) throw new Error("Analiz için tekrar oturum açın.");

  const token = await user.getIdToken().catch(() => {
    throw new Error("Oturum doğrulanamadı. Lütfen tekrar oturum açın.");
  });

  const response = await fetch("/api/attendance/analyze", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => {
    throw new Error(fallbackMessage);
  });

  if (response.ok) return response.json();

  const body = await response.json().catch(() => null);
  throw new Error(typeof body?.error === "string" ? body.error : fallbackMessage);
}
