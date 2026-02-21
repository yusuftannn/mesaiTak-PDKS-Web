import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { secondaryAuth } from "@/lib/firebase";

export type UserRole = "employee" | "admin" | "manager";
export type UserStatus = "active" | "passive";

export type AppUser = {
  id: string;
  uid: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  companyId: string | null;
  branchId: string | null;
  country?: string;
  status: UserStatus;
};

type UserDoc = Omit<AppUser, "id">;

export async function listUsers(): Promise<AppUser[]> {
  const snap = await getDocs(collection(db, "users"));

  return snap.docs.map((d) => {
    const data = d.data() as UserDoc;

    return {
      id: d.id,
      ...data,
    };
  });
}

export async function createUser(params: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: UserRole;
  companyId: string | null;
  branchId: string | null;
  country?: string;
}) {
  const cred = await createUserWithEmailAndPassword(
    secondaryAuth,
    params.email,
    params.password,
  );

  await setDoc(doc(db, "users", cred.user.uid), {
    uid: cred.user.uid,
    name: params.name,
    email: params.email,
    phone: params.phone ?? null,
    role: params.role,
    companyId: params.companyId,
    branchId: params.branchId,
    country: params.country ?? "Turkiye",
    status: "active",
    createdAt: serverTimestamp(),
  });
}

export async function updateUser(
  userId: string,
  data: Partial<
    Pick<
      AppUser,
      | "role"
      | "companyId"
      | "branchId"
      | "status"
      | "phone"
      | "name"
      | "country"
    >
  >,
) {
  await updateDoc(doc(db, "users", userId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}
