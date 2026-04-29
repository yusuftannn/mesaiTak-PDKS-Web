import {
  collection,
  getDocs,
  query,
  orderBy,
  Timestamp,
  addDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Excuse, ExcuseDoc, ExcuseType } from "./excuses.types";
import { getCompanyId } from "@/lib/utils/company";

const excuseRef = collection(db, "excuses");

function mapDocToExcuse(id: string, data: ExcuseDoc): Excuse {
  return {
    id,
    userId: data.userId,
    type: data.type,
    description: data.description,
    date: data.date.toDate(),
    createdAt: data.createdAt.toDate(),
  };
}

function isExcuseType(value: string): value is ExcuseType {
  return value === "late" || value === "early";
}

export async function listExcuses(): Promise<Excuse[]> {
  const companyId = getCompanyId();
  const q = query(
    excuseRef,
    orderBy("createdAt", "desc"),
    where("companyId", "==", companyId),
  );
  const snap = await getDocs(q);

  return snap.docs.map((d) => mapDocToExcuse(d.id, d.data() as ExcuseDoc));
}

export async function createExcuse(data: {
  userId: string;
  type: string;
  description: string;
  date?: Date;
}) {
  if (!isExcuseType(data.type)) {
    throw new Error("Geçersiz mazeret tipi");
  }

  const companyId = getCompanyId();

  const payload: ExcuseDoc = {
    userId: data.userId,
    type: data.type,
    description: data.description,
    date: Timestamp.fromDate(data.date ?? new Date()),
    createdAt: Timestamp.now(),
    companyId,
  };

  await addDoc(excuseRef, payload);
}
