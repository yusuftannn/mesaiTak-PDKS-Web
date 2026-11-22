import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { AttendanceAnalysisError, analyzeCompanyAttendance } from "@/lib/server/attendance-analysis";

export const runtime = "nodejs";
export const maxDuration = 60;

function getAdminApp() {
  const name = "attendance-analysis";
  const existing = getApps().find((app) => app.name === name);
  if (existing) return existing;

  const config = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!config || !projectId) {
    throw new AttendanceAnalysisError(503, "Mesai analizi sunucuda henüz yapılandırılmadı.");
  }

  const account = JSON.parse(config);
  if (account.project_id !== projectId) {
    throw new AttendanceAnalysisError(503, "Mesai analizinin Firebase proje ayarı hatalı.");
  }
  return initializeApp({ credential: cert(account), projectId }, name);
}

function json(body: unknown, status: number) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...(status === 429 && { "Retry-After": "60" }) },
  });
}

export async function POST(request: Request) {
  const token = request.headers.get("authorization")?.match(/^Bearer ([^\s]+)$/i)?.[1];
  if (!token) return json({ error: "Analiz için tekrar oturum açın." }, 401);

  try {
    const app = getAdminApp();
    const identity = await getAuth(app).verifyIdToken(token).catch(() => null);
    if (!identity) return json({ error: "Analiz için tekrar oturum açın." }, 401);

    const report = await analyzeCompanyAttendance(getFirestore(app), identity.uid);
    return json(report, 200);
  } catch (error) {
    if (error instanceof AttendanceAnalysisError) {
      return json({ error: error.message }, error.status);
    }
    if (typeof error === "object" && error && "code" in error && error.code === 8) {
      return json({ error: "Firestore okuma kotası doldu. Daha sonra tekrar deneyin." }, 429);
    }
    console.error("Attendance analysis failed", error instanceof Error ? error.name : "Unknown error");
    return json({ error: "Analiz başlatılamadı. Lütfen tekrar deneyin." }, 500);
  }
}
