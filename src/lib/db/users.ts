import { db } from "@/lib/firebase";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";

export type UserRole = "employee" | "admin" | "manager";

export type AppUser = {
  id: string;
  name: string;
  role: UserRole;
  companyId: string | null;
  branchId: string | null;
};

type UserDoc = {
  name: string;
  role: UserRole;
  companyId?: string | null;
  branchId?: string | null;
};

export async function listUsers(): Promise<AppUser[]> {
  const snap = await getDocs(collection(db, "users"));

  return snap.docs.map((d) => {
    const data = d.data() as UserDoc;

    return {
      id: d.id,
      name: data.name,
      role: data.role,
      companyId: data.companyId ?? null,
      branchId: data.branchId ?? null,
    };
  });
}

export async function updateUser(
  userId: string,
  data: Partial<Pick<AppUser, "role" | "companyId" | "branchId">>,
) {
  await updateDoc(doc(db, "users", userId), data);
}
