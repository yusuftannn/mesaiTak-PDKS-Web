import { COLLECTIONS } from "@/constants/collections";
import { db } from "@/lib/firebase";
import { getCompanyId } from "@/lib/utils/company";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { WeeklyAiReport } from "./ai-reports.types";

export function subscribeLatestAiReport(params: {
  onData: (report: WeeklyAiReport | null) => void;
  onError: (error: Error) => void;
}) {
  const companyId = getCompanyId();

  const reportsRef = collection(
    db,
    COLLECTIONS.COMPANIES,
    companyId,
    "aiReports",
  );

  const latestReportQuery = query(
    reportsRef,
    orderBy("createdAt", "desc"),
    limit(1),
  );

  return onSnapshot(
    latestReportQuery,
    (snapshot) => {
      if (snapshot.empty) {
        params.onData(null);
        return;
      }

      const docSnap = snapshot.docs[0];
      const data = docSnap.data();

      params.onData({
        id: docSnap.id,
        weekId: data.weekId ?? docSnap.id,
        summary: data.summary ?? "",
        riskAnalysis: data.riskAnalysis,
        stats: data.stats,
        createdAt: data.createdAt?.toDate?.() ?? null,
      });
    },
    (error) => params.onError(error),
  );
}
