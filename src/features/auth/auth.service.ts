import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export async function getEmailByUsername(
  userName: string,
): Promise<string | null> {
  const q = query(collection(db, "users"), where("userName", "==", userName));

  const snap = await getDocs(q);

  if (snap.empty) return null;

  const data = snap.docs[0].data();
  return data.email ?? null;
}
