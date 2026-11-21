import { app } from "@/lib/firebase";
import { connectFunctionsEmulator, getFunctions, httpsCallable } from "firebase/functions";
import type { WeeklyAiReport } from "./ai-reports.types";

const functions = getFunctions(app, "europe-west1");

if (process.env.NEXT_PUBLIC_USE_FUNCTIONS_EMULATOR === "true") {
  connectFunctionsEmulator(functions, "127.0.0.1", 5001);
}

const analyzeCompanyAttendance = httpsCallable<void, WeeklyAiReport>(
  functions,
  "analyzeCompanyAttendance",
  { timeout: 95_000 },
);

export async function analyzeAttendance() {
  const { data } = await analyzeCompanyAttendance();
  return data;
}
