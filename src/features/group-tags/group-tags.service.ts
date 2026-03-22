import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";

import {
  GroupTag,
  GroupTagDoc,
  UserDoc,
} from "@/features/group-tags/group-tags.types";
import { getCompanyId } from "@/lib/utils/company";

export async function listGroupTags(): Promise<GroupTag[]> {
  const companyId = getCompanyId();

  const tagsQuery = query(
    collection(db, "groupTags"),
    where("companyId", "==", companyId),
  );

  const tagsSnap = await getDocs(tagsQuery);

  const usersQuery = query(
    collection(db, "users"),
    where("companyId", "==", companyId),
  );

  const usersSnap = await getDocs(usersQuery);

  const tagCountMap = new Map<string, number>();

  usersSnap.docs.forEach((doc) => {
    const data = doc.data() as UserDoc;

    const tagIds = data.groupTagIds ?? [];

    tagIds.forEach((tagId) => {
      tagCountMap.set(tagId, (tagCountMap.get(tagId) || 0) + 1);
    });
  });

  return tagsSnap.docs.map((d) => {
    const data = d.data() as GroupTagDoc;

    return {
      id: d.id,
      name: data.name,
      refId: data.refId,
      companyId: data.companyId,

      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),

      userCount: tagCountMap.get(d.id) ?? 0,
    };
  });
}

export async function createGroupTag(name: string) {
  const companyId = getCompanyId();

  const refId = crypto.randomUUID().slice(0, 8);

  await addDoc(collection(db, "groupTags"), {
    name,
    refId,
    companyId,

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateGroupTag(id: string, name: string) {
  await updateDoc(doc(db, "groupTags", id), {
    name,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteGroupTag(id: string) {
  await deleteDoc(doc(db, "groupTags", id));
}
