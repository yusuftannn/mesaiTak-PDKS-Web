import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { SuspiciousLog, SuspiciousLogDoc } from "./suspicious.types";
import { getCompanyId } from "@/lib/utils/company";

const ref = collection(db, "suspicious_logs");

export async function listSuspiciousLogs(): Promise<SuspiciousLog[]> {
  const companyId = getCompanyId();
  const q = query(
    ref,
    where("companyId", "==", companyId),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);

  return snap.docs.map((d) => {
    const data = d.data() as SuspiciousLogDoc;

    return {
      id: d.id,
      userId: data.userId,
      userName: data.userName,
      branchId: data.branchId,
      branchName: data.branchName,
      distance: data.distance,
      allowedDistance: data.allowedDistance,
      severity:
        data.severity ??
        (data.distance > 1000
          ? "high"
          : data.distance > 500
            ? "medium"
            : "low"),
      userLat: data.userLat,
      userLng: data.userLng,
      branchLat: data.branchLat,
      branchLng: data.branchLng,
      createdAt: data.createdAt.toDate(),
    };
  });
}
export type { SuspiciousLog };
