import { db, secondaryAuth } from "@/lib/firebase";

import {
  collection,
  doc,
  getDocs,
  updateDoc,
  serverTimestamp,
  setDoc,
  query,
  where,
} from "firebase/firestore";

import { AppUser, CreateUserParams, UpdateUserParams } from "./users.types";
import { COLLECTIONS } from "@/constants/collections";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { getCompanyId } from "@/lib/utils/company";

type UserDoc = Omit<AppUser, "id">;

export async function listUsers(): Promise<AppUser[]> {
  const companyId = getCompanyId();

  const q = query(
    collection(db, COLLECTIONS.USERS),
    where("companyId", "==", companyId),
  );

  const snap = await getDocs(q);

  return snap.docs.map((d) => {
    const data = d.data() as UserDoc;

    return {
      id: d.id,
      ...data,
      groupTagIds: data.groupTagIds ?? [],
    };
  });
}

export async function listAllUsers(): Promise<AppUser[]> {
  const snap = await getDocs(collection(db, COLLECTIONS.USERS));

  return snap.docs.map((d) => {
    const data = d.data() as UserDoc;

    return {
      id: d.id,
      ...data,
      groupTagIds: data.groupTagIds ?? [],
    };
  });
}

export async function createUser(params: CreateUserParams) {
  const companyId = getCompanyId();

  const cred = await createUserWithEmailAndPassword(
    secondaryAuth,
    params.email,
    params.password,
  );

  const uid = cred.user.uid;

  await setDoc(doc(db, "users", uid), {
    uid,
    name: params.name,
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
  await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
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
