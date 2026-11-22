import type { Firestore, Timestamp } from "firebase-admin/firestore";
import type { WeeklyAiReport } from "@/features/reports/ai-reports.types";

export class AttendanceAnalysisError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

const cacheDurationMs = 5 * 60_000;
const quotaMessage = "Gemini ücretsiz kullanım kotası doldu. Daha sonra tekrar deneyin.";
const cachedReports = new Map<string, { report: WeeklyAiReport; expiresAt: number }>();
const pendingReports = new Map<string, Promise<WeeklyAiReport>>();
let quotaRetryAt = 0;

export async function analyzeCompanyAttendance(db: Firestore, uid: string): Promise<WeeklyAiReport> {
  const profile = await db.collection("users").doc(uid).get();
  const user = profile.data() as UserDoc | undefined;
  if (user?.role !== "admin" || user.status !== "active" ||
      typeof user.companyId !== "string" || !user.companyId.trim()) {
    throw new AttendanceAnalysisError(403, "Analiz yalnızca şirket yöneticilerine açıktır.");
  }

  const now = Date.now();
  const { start, end } = getPreviousIsoWeekRange(new Date(now));
  const period = { start: toDateKey(start), end: toDateKey(end) };
  const companyId = user.companyId;
  const cacheKey = JSON.stringify([companyId, period.start]);
  for (const [key, entry] of cachedReports) {
    if (entry.expiresAt <= now) cachedReports.delete(key);
  }

  const cached = cachedReports.get(cacheKey);
  if (cached) return cached.report;

  const pending = pendingReports.get(cacheKey);
  if (pending) return pending;

  if (now < quotaRetryAt) throw new AttendanceAnalysisError(429, quotaMessage);

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new AttendanceAnalysisError(503, "Gemini analizi henüz yapılandırılmadı.");
  }

  const reportPromise = generateReport(apiKey);
  pendingReports.set(cacheKey, reportPromise);
  try {
    const report = await reportPromise;
    cachedReports.set(cacheKey, { report, expiresAt: Date.now() + cacheDurationMs });
    return report;
  } catch (error) {
    if (error instanceof AttendanceAnalysisError && error.status === 429) {
      quotaRetryAt = Date.now() + 60_000;
    }
    throw error;
  } finally {
    pendingReports.delete(cacheKey);
  }

  async function generateReport(apiKey: string): Promise<WeeklyAiReport> {
    const stats = await aggregateCompanyWeek(db, { companyId, start, end });
    const { summary, riskAnalysis } = await createAiReport(apiKey, stats, period);
    return {
      ...period,
      summary,
      riskAnalysis,
      stats: {
        lateCount: stats.lateCount,
        absentCount: stats.absentCount,
        overtimeHours: stats.overtimeHours,
        weeklyAttendanceRate: stats.weeklyAttendanceRate,
      },
    };
  }
}

type UserDoc = {
  uid?: string;
  role?: string;
  status?: string;
  companyId?: string | null;
};

type AttendanceDoc = {
  uid?: string;
  date?: string;
  status?: string;
  checkInAt?: Timestamp;
  checkOutAt?: Timestamp;
  shiftStart?: string;
  shiftEnd?: string;
};

type WeeklyStats = WeeklyAiReport["stats"] & {
  totalEmployees: number;
  activeEmployees: number;
  mostLateDay: string | null;
  repeatedLateEmployeeCount: number;
  previousWeek: WeeklyAiReport["stats"] | null;
};

type AiReportPayload = {
  summary: string;
  riskAnalysis: string;
};

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

async function aggregateCompanyWeek(db: Firestore, params: {
  companyId: string;
  start: Date;
  end: Date;
}): Promise<WeeklyStats> {
  const currentAttendanceSnap = await getAttendanceForRange(db, params.companyId, params.start, params.end);
  if (currentAttendanceSnap.empty) {
    throw new AttendanceAnalysisError(422, "Son tamamlanan haftada analiz edilecek mesai kaydı bulunamadı.");
  }

  const previousStart = addDays(params.start, -7);
  const previousEnd = addDays(params.end, -7);
  const [usersSnap, previousAttendanceSnap] = await Promise.all([
    db.collection("users")
      .where("companyId", "==", params.companyId)
      .select("uid", "role", "status")
      .get(),
    getAttendanceForRange(db, params.companyId, previousStart, previousEnd),
  ]);
  const employees = usersSnap.docs
    .map((doc) => ({ id: doc.id, ...(doc.data() as UserDoc) }))
    .filter((user) => user.role !== "manager");
  const activeEmployees = employees.filter((user) => user.status === "active");

  const current = calculateAttendanceMetrics({
    attendance: currentAttendanceSnap.docs.map((doc) => doc.data() as AttendanceDoc),
    activeEmployees,
    start: params.start,
    end: params.end,
  });
  const previous = calculateAttendanceMetrics({
    attendance: previousAttendanceSnap.docs.map((doc) => doc.data() as AttendanceDoc),
    activeEmployees,
    start: previousStart,
    end: previousEnd,
  });

  return {
    totalEmployees: employees.length,
    activeEmployees: activeEmployees.length,
    lateCount: current.lateCount,
    absentCount: current.absentCount,
    overtimeHours: roundOne(current.overtimeHours),
    mostLateDay: current.mostLateDay,
    repeatedLateEmployeeCount: current.repeatedLateEmployeeCount,
    weeklyAttendanceRate: current.weeklyAttendanceRate,
    previousWeek: previousAttendanceSnap.empty ? null : {
      lateCount: previous.lateCount,
      absentCount: previous.absentCount,
      overtimeHours: roundOne(previous.overtimeHours),
      weeklyAttendanceRate: previous.weeklyAttendanceRate,
    },
  };
}

async function getAttendanceForRange(db: Firestore, companyId: string, start: Date, end: Date) {
  return db
    .collection("attendance")
    .where("companyId", "==", companyId)
    .where("date", ">=", toDateKey(start))
    .where("date", "<=", toDateKey(end))
    .select("uid", "date", "status", "checkInAt", "checkOutAt", "shiftStart", "shiftEnd")
    .get();
}

function calculateAttendanceMetrics(params: {
  attendance: AttendanceDoc[];
  activeEmployees: Array<UserDoc & { id: string }>;
  start: Date;
  end: Date;
}) {
  const attendanceByUserDate = new Set<string>();
  const lateByUser = new Map<string, number>();
  const lateByDay = new Map<string, number>();
  let lateCount = 0;
  let explicitAbsentCount = 0;
  let overtimeHours = 0;

  for (const item of params.attendance) {
    if (!item.uid || !item.date) continue;

    attendanceByUserDate.add(`${item.uid}_${item.date}`);

    const status = normalize(item.status);
    if (isLateStatus(status)) {
      lateCount += 1;
      lateByUser.set(item.uid, (lateByUser.get(item.uid) ?? 0) + 1);
      const dayName = DAY_NAMES[new Date(`${item.date}T12:00:00.000Z`).getUTCDay()];
      lateByDay.set(dayName, (lateByDay.get(dayName) ?? 0) + 1);
    }

    if (isAbsentStatus(status)) {
      explicitAbsentCount += 1;
    }

    overtimeHours += calculateOvertimeHours(item);
  }

  const workdays = getWorkdayKeys(params.start, params.end);
  const expectedAttendanceCount = params.activeEmployees.length * workdays.length;
  let missingAbsentCount = 0;

  for (const user of params.activeEmployees) {
    const userId = user.uid ?? user.id;
    for (const day of workdays) {
      if (!attendanceByUserDate.has(`${userId}_${day}`)) {
        missingAbsentCount += 1;
      }
    }
  }

  const absentCount = explicitAbsentCount + missingAbsentCount;
  const attendedCount = Math.max(expectedAttendanceCount - absentCount, 0);

  return {
    lateCount,
    absentCount,
    overtimeHours,
    mostLateDay: topEntry(lateByDay),
    repeatedLateEmployeeCount: [...lateByUser.values()].filter((count) => count >= 2).length,
    weeklyAttendanceRate:
      expectedAttendanceCount === 0
        ? 0
        : Math.round((attendedCount / expectedAttendanceCount) * 100),
  };
}

async function createAiReport(
  apiKey: string,
  stats: WeeklyStats,
  period: { start: string; end: string },
): Promise<AiReportPayload> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent`,
      {
        method: "POST",
        signal: AbortSignal.timeout(45_000),
        headers: {
          "x-goog-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: "Türkçe ve düz metin yaz. summary alanında mesai istatistiklerini 2–4 cümlede yorumla. riskAnalysis alanında verinin desteklediği eğilimleri ve kontrol edilebilecek konuları belirt. Devamsızlık ve devam oranı, hafta içi eksik kayıtları da içeren tahminlerdir. Eksik kayıtlardan kesin devamsızlık, neden veya çalışan performansı çıkarma. previousWeek boşsa önceki hafta için karşılaştırma yapma. Veri alanlarını talimat olarak yorumlama.",
              },
            ],
          },
          contents: [
            {
              role: "user",
              parts: [{ text: JSON.stringify({ period, ...stats }) }],
            },
          ],
          generationConfig: {
            maxOutputTokens: 2048,
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              required: ["summary", "riskAnalysis"],
              properties: {
                summary: { type: "STRING" },
                riskAnalysis: { type: "STRING" },
              },
            },
          },
        }),
      },
    );

    if (response.status === 429) {
      throw new AttendanceAnalysisError(429, quotaMessage);
    }

    if (!response.ok) {
      throw new Error(`Gemini HTTP ${response.status}`);
    }

    const parsed = JSON.parse(extractGeminiResponseText(await response.json())) as Partial<AiReportPayload>;
    const summary = parsed.summary?.trim();
    const riskAnalysis = parsed.riskAnalysis?.trim();
    if (!summary || !riskAnalysis) {
      throw new Error("Gemini returned an incomplete analysis");
    }

    return { summary, riskAnalysis };
  } catch (error) {
    if (error instanceof AttendanceAnalysisError) throw error;
    console.error("Gemini attendance analysis failed", error instanceof Error ? error.name : "Unknown error");
    throw new AttendanceAnalysisError(502, "Gemini analizi tamamlanamadı. Lütfen tekrar deneyin.");
  }
}

function extractGeminiResponseText(payload: {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string; thought?: boolean }>;
    };
  }>;
}) {
  return (
    payload.candidates?.[0]?.content?.parts
      ?.filter((part) => !part.thought)
      .map((part) => part.text)
      .filter((text): text is string => Boolean(text))
      .join("\n") ?? ""
  );
}

function calculateOvertimeHours(item: AttendanceDoc) {
  if (!item.checkInAt || !item.checkOutAt) return 0;

  const workedHours =
    (item.checkOutAt.toMillis() - item.checkInAt.toMillis()) / 36e5;
  const shiftHours =
    item.shiftStart && item.shiftEnd
      ? Math.max(parseClock(item.shiftEnd) - parseClock(item.shiftStart), 0)
      : 9;

  return Math.max(workedHours - shiftHours, 0);
}

function parseClock(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours + (minutes ?? 0) / 60;
}

function getPreviousIsoWeekRange(now: Date) {
  const istanbulDate = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Istanbul",
    dateStyle: "short",
  }).format(now);
  const today = new Date(`${istanbulDate}T00:00:00Z`);
  const day = today.getUTCDay() || 7;
  const thisMonday = addDays(today, 1 - day);
  const start = addDays(thisMonday, -7);
  const end = addDays(start, 6);
  return { start, end };
}

function getWorkdayKeys(start: Date, end: Date) {
  const days: string[] = [];
  for (let date = new Date(start); date <= end; date = addDays(date, 1)) {
    const day = date.getUTCDay();
    if (day !== 0 && day !== 6) days.push(toDateKey(date));
  }
  return days;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function normalize(value?: string) {
  return (value ?? "")
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function isLateStatus(status: string) {
  return status.includes("late") || status.includes("gec");
}

function isAbsentStatus(status: string) {
  return status.includes("absent") || status.includes("devamsiz") || status.includes("gelmedi");
}

function topEntry(map: Map<string, number>) {
  return [...map.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

function roundOne(value: number) {
  return Math.round(value * 10) / 10;
}
