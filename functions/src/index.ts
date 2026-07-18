import { initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { defineSecret } from "firebase-functions/params";
import { logger } from "firebase-functions";

initializeApp();

const db = getFirestore();
const openAiApiKey = defineSecret("OPENAI_API_KEY");

type CompanyDoc = {
  companyId?: string;
  name?: string;
};

type UserDoc = {
  uid?: string;
  name?: string;
  role?: string;
  status?: string;
  companyId?: string | null;
  branchId?: string | null;
};

type BranchDoc = {
  name?: string;
  companyId?: string;
};

type AttendanceDoc = {
  uid?: string;
  companyId?: string;
  date?: string;
  status?: string;
  checkInAt?: FirebaseFirestore.Timestamp;
  checkOutAt?: FirebaseFirestore.Timestamp;
  shiftStart?: string;
  shiftEnd?: string;
};

type WeeklyStats = {
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

export const generateWeeklyAiReports = onSchedule(
  {
    schedule: "every monday 09:00",
    timeZone: "Europe/Istanbul",
    region: "europe-west1",
    timeoutSeconds: 540,
    memory: "512MiB",
    secrets: [openAiApiKey],
  },
  async () => {
    const range = getPreviousIsoWeekRange(new Date());
    const weekId = getIsoWeekId(range.start);

    const companiesSnap = await db.collection("companies").get();

    await Promise.allSettled(
      companiesSnap.docs.map(async (companyDoc) => {
        const company = companyDoc.data() as CompanyDoc;
        const companyId = company.companyId ?? companyDoc.id;
        const companyName = company.name ?? "MesaiTak";

        const reportRef = db
          .collection("companies")
          .doc(companyId)
          .collection("aiReports")
          .doc(weekId);

        const cachedReport = await reportRef.get();
        if (cachedReport.exists) {
          logger.info("Weekly AI report already exists", {
            companyId,
            weekId,
          });
          return;
        }

        const stats = await aggregateCompanyWeek({
          companyId,
          companyName,
          start: range.start,
          end: range.end,
        });

        const aiReport = await createAiReport(stats);

        await reportRef.set({
          summary: aiReport.summary,
          riskAnalysis: aiReport.riskAnalysis,
          stats,
          weekId,
          createdAt: FieldValue.serverTimestamp(),
          source: "scheduled-function",
          model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
        });
      }),
    );
  },
);

async function aggregateCompanyWeek(params: {
  companyId: string;
  companyName: string;
  start: Date;
  end: Date;
}): Promise<WeeklyStats> {
  const [usersSnap, branchesSnap, currentAttendanceSnap, previousAttendanceSnap] =
    await Promise.all([
      db
        .collection("users")
        .where("companyId", "==", params.companyId)
        .get(),
      db
        .collection("branches")
        .where("companyId", "==", params.companyId)
        .get(),
      getAttendanceForRange(params.companyId, params.start, params.end),
      getAttendanceForRange(
        params.companyId,
        addDays(params.start, -7),
        addDays(params.end, -7),
      ),
    ]);

  const employees = usersSnap.docs
    .map((doc) => ({ id: doc.id, ...(doc.data() as UserDoc) }))
    .filter((user) => user.role !== "manager");
  const activeEmployees = employees.filter((user) => user.status === "active");
  const userById = new Map(employees.map((user) => [user.uid ?? user.id, user]));
  const branchNameById = new Map(
    branchesSnap.docs.map((doc) => {
      const branch = doc.data() as BranchDoc;
      return [doc.id, branch.name ?? "Bilinmeyen şube"];
    }),
  );

  const current = calculateAttendanceMetrics({
    attendance: currentAttendanceSnap.docs.map((doc) => doc.data() as AttendanceDoc),
    activeEmployees,
    userById,
    branchNameById,
    start: params.start,
    end: params.end,
  });
  const previous = calculateAttendanceMetrics({
    attendance: previousAttendanceSnap.docs.map((doc) => doc.data() as AttendanceDoc),
    activeEmployees,
    userById,
    branchNameById,
    start: addDays(params.start, -7),
    end: addDays(params.end, -7),
  });

  return {
    companyName: params.companyName,
    totalEmployees: employees.length,
    activeEmployees: activeEmployees.length,
    lateCount: current.lateCount,
    absentCount: current.absentCount,
    overtimeHours: roundOne(current.overtimeHours),
    mostLateDay: current.mostLateDay,
    topBranch: current.topBranch,
    repeatedLateEmployees: current.repeatedLateEmployees,
    weeklyAttendanceRate: current.weeklyAttendanceRate,
    previousWeekComparison: compare(current.weeklyAttendanceRate, previous.weeklyAttendanceRate),
    lateIncreasePercent: percentChange(current.lateCount, previous.lateCount),
    overtimeIncreasePercent: percentChange(current.overtimeHours, previous.overtimeHours),
  };
}

async function getAttendanceForRange(companyId: string, start: Date, end: Date) {
  return db
    .collection("attendance")
    .where("companyId", "==", companyId)
    .where("date", ">=", toDateKey(start))
    .where("date", "<=", toDateKey(end))
    .get();
}

function calculateAttendanceMetrics(params: {
  attendance: AttendanceDoc[];
  activeEmployees: Array<UserDoc & { id: string }>;
  userById: Map<string, UserDoc & { id: string }>;
  branchNameById: Map<string, string>;
  start: Date;
  end: Date;
}) {
  const attendanceByUserDate = new Set<string>();
  const lateByUser = new Map<string, number>();
  const lateByDay = new Map<string, number>();
  const branchAttendance = new Map<string, number>();
  let lateCount = 0;
  let explicitAbsentCount = 0;
  let overtimeHours = 0;

  for (const item of params.attendance) {
    if (!item.uid || !item.date) continue;

    attendanceByUserDate.add(`${item.uid}_${item.date}`);

    const status = normalize(item.status);
    const user = params.userById.get(item.uid);
    const branchName = user?.branchId
      ? params.branchNameById.get(user.branchId) ?? "Bilinmeyen şube"
      : "Şubesiz";
    branchAttendance.set(branchName, (branchAttendance.get(branchName) ?? 0) + 1);

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
    topBranch: topEntry(branchAttendance),
    repeatedLateEmployees: [...lateByUser.entries()]
      .filter(([, count]) => count >= 2)
      .map(([uid]) => params.userById.get(uid)?.name ?? "Bilinmeyen çalışan")
      .slice(0, 5),
    weeklyAttendanceRate:
      expectedAttendanceCount === 0
        ? 0
        : Math.round((attendedCount / expectedAttendanceCount) * 100),
  };
}

async function createAiReport(stats: WeeklyStats): Promise<AiReportPayload> {
  const fallback = createFallbackReport(stats);
  const key = openAiApiKey.value();

  if (!key) return fallback;

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
        instructions:
          "You are an HR operations analyst. Write in Turkish. Use only the provided aggregate statistics. Never infer from raw attendance records or mention unavailable data.",
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: JSON.stringify(compactStatsForAi(stats)),
              },
            ],
          },
        ],
        max_output_tokens: 260,
        text: {
          format: {
            type: "json_schema",
            name: "weekly_company_report",
            schema: {
              type: "object",
              additionalProperties: false,
              required: ["summary", "riskAnalysis"],
              properties: {
                summary: {
                  type: "string",
                  description:
                    "A concise executive weekly summary with 3-5 bullet points.",
                },
                riskAnalysis: {
                  type: "string",
                  description:
                    "One short operational risk insight based on repeated lateness or trend metrics.",
                },
              },
            },
          },
        },
      }),
    });

    if (!response.ok) {
      logger.warn("OpenAI request failed", {
        status: response.status,
        body: await response.text(),
      });
      return fallback;
    }

    const payload = await response.json();
    const text = extractResponseText(payload);
    const parsed = JSON.parse(text) as Partial<AiReportPayload>;

    return {
      summary: parsed.summary?.trim() || fallback.summary,
      riskAnalysis: parsed.riskAnalysis?.trim() || fallback.riskAnalysis,
    };
  } catch (error) {
    logger.warn("OpenAI report generation fell back to template", error);
    return fallback;
  }
}

function compactStatsForAi(stats: WeeklyStats) {
  return {
    companyName: stats.companyName,
    totalEmployees: stats.totalEmployees,
    activeEmployees: stats.activeEmployees,
    lateCount: stats.lateCount,
    absentCount: stats.absentCount,
    overtimeHours: stats.overtimeHours,
    topBranch: stats.topBranch,
    mostLateDay: stats.mostLateDay,
    lateIncreasePercent: stats.lateIncreasePercent,
    overtimeIncreasePercent: stats.overtimeIncreasePercent,
    weeklyAttendanceRate: stats.weeklyAttendanceRate,
    previousWeekComparison: stats.previousWeekComparison,
    repeatedLateEmployees: stats.repeatedLateEmployees,
  };
}

function createFallbackReport(stats: WeeklyStats): AiReportPayload {
  const summary = [
    `• Bu hafta devam oranı %${stats.weeklyAttendanceRate} olarak gerçekleşti.`,
    `• Geç kalma sayısı ${stats.lateCount}, devamsızlık sayısı ${stats.absentCount} olarak hesaplandı.`,
    stats.topBranch
      ? `• En yoğun şube ${stats.topBranch} şubesi oldu.`
      : "• Şube yoğunluğu için yeterli kayıt bulunamadı.",
    `• Fazla mesai toplamı ${stats.overtimeHours} saat olarak ölçüldü.`,
  ].join("\n");

  const riskAnalysis =
    stats.repeatedLateEmployees.length > 0
      ? `Son hafta içinde düzenli geç kalan ${stats.repeatedLateEmployees.length} çalışan tespit edildi.`
      : "Bu hafta tekrar eden geç kalma davranışı için belirgin bir risk tespit edilmedi.";

  return { summary, riskAnalysis };
}

function extractResponseText(payload: {
  output_text?: string;
  output?: Array<{ content?: Array<{ text?: string }> }>;
}) {
  if (payload.output_text) return payload.output_text;

  return (
    payload.output
      ?.flatMap((item) => item.content ?? [])
      .map((content) => content.text)
      .filter(Boolean)
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
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const day = today.getUTCDay() || 7;
  const thisMonday = addDays(today, 1 - day);
  const start = addDays(thisMonday, -7);
  const end = addDays(start, 6);
  return { start, end };
}

function getIsoWeekId(date: Date) {
  const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNumber = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNumber);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((target.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${target.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
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

function percentChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function compare(current: number, previous: number): "up" | "down" | "flat" {
  if (current > previous) return "up";
  if (current < previous) return "down";
  return "flat";
}

function roundOne(value: number) {
  return Math.round(value * 10) / 10;
}
