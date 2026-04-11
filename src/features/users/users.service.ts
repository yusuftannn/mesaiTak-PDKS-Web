import { db, secondaryAuth } from "@/lib/firebase";

import {
  collection,
  doc,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  setDoc,
  getDoc,
  query,
  where,
} from "firebase/firestore";

import { AppUser, CreateUserParams, UpdateUserParams } from "./users.types";
import { COLLECTIONS } from "@/constants/collections";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useAuthStore } from "@/features/auth/auth.store";

type UserDoc = Omit<AppUser, "id">;

export async function listUsers(): Promise<AppUser[]> {
  const currentUser = useAuthStore.getState().user;

  if (!currentUser) {
    throw new Error("User bulunamadı");
  }

  let users: AppUser[] = [];

  if (currentUser.role === "manager") {
    const snap = await getDocs(collection(db, COLLECTIONS.USERS));

    users = snap.docs.map((d) => {
      const data = d.data() as UserDoc;

      return {
        id: d.id,
        ...data,
        groupTagIds: data.groupTagIds ?? [],
      };
    });

    return users;
  }

  const companyId = currentUser.companyId;

  if (!companyId) {
    throw new Error("CompanyId bulunamadı");
  }

  const q = query(
    collection(db, COLLECTIONS.USERS),
    where("companyId", "==", companyId),
  );

  const snap = await getDocs(q);

  users = snap.docs.map((d) => {
    const data = d.data() as UserDoc;

    return {
      id: d.id,
      ...data,
      groupTagIds: data.groupTagIds ?? [],
    };
  });

  return users.filter((u) => u.role !== "manager");
}

export async function createUser(params: CreateUserParams) {
  const q = query(
    collection(db, COLLECTIONS.USERS),
    where("userName", "==", params.userName),
  );

  const snap = await getDocs(q);

  if (!snap.empty) {
    throw new Error("Bu kullanıcı adı zaten alınmış");
  }
  const currentUser = useAuthStore.getState().user;

  if (!currentUser) {
    throw new Error("User bulunamadı");
  }

  const companyId =
    currentUser.role === "manager" ? params.companyId : currentUser.companyId;

  const cred = await createUserWithEmailAndPassword(
    secondaryAuth,
    params.email,
    params.password,
  );

  const uid = cred.user.uid;

  await setDoc(doc(db, "users", uid), {
    uid,
    name: params.name,
    userName: params.userName,
    email: params.email,
    phone: params.phone ?? null,

    role: params.role,

    companyId,
    branchId: params.branchId,

    groupTagIds: params.groupTagIds ?? [],

    country: params.country ?? "Turkiye",

    status: "active",

    createdAt: serverTimestamp(),
  });
}

export async function updateUser(userId: string, data: UpdateUserParams) {
  const userRef = doc(db, COLLECTIONS.USERS, userId);

  const snap = await getDoc(userRef);
  if (!snap.exists()) throw new Error("User not found");

  const existing = snap.data() as UserDoc;

  const currentUser = useAuthStore.getState().user;

  if (existing.role === "manager" && currentUser?.role !== "manager") {
    throw new Error("Manager kullanıcı değiştirilemez");
  }

  await updateDoc(userRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteUser(userId: string) {
  const currentUser = useAuthStore.getState().user;

  if (!currentUser) {
    throw new Error("User bulunamadı");
  }

  const userRef = doc(db, COLLECTIONS.USERS, userId);

  const snap = await getDoc(userRef);
  if (!snap.exists()) throw new Error("User bulunamadı");

  const existing = snap.data() as UserDoc;

  if (existing.role === "manager") {
    throw new Error("Manager kullanıcı silinemez");
  }

  await deleteDoc(userRef);
}

export async function setUserGroupTag(userId: string, groupTagIds: string[]) {
  await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
    groupTagIds,
    updatedAt: serverTimestamp(),
  });
}

export async function saveUserDocument(uid: string, params: CreateUserParams) {
  await setDoc(doc(db, COLLECTIONS.USERS, uid), {
    uid,
    name: params.name,
    userName: params.userName,
    email: params.email,
    phone: params.phone ?? null,

    role: params.role,

    companyId: params.companyId,
    branchId: params.branchId,

    groupTagIds: params.groupTagIds ?? [],

    country: params.country ?? "Turkiye",

    status: "active",

    createdAt: serverTimestamp(),
  });
}
