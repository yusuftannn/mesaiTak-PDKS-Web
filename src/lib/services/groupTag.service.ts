import { db } from "@/lib/firebase"
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  where
} from "firebase/firestore"

import { GroupTag } from "@/types/groupTag"

export async function listGroupTags(companyId: string): Promise<GroupTag[]> {

  const q = query(
    collection(db, "groupTags"),
    where("companyId", "==", companyId)
  )

  const snap = await getDocs(q)

  const tags: GroupTag[] = []

  for (const d of snap.docs) {

    const data = d.data()

    const usersSnap = await getDocs(
      query(collection(db, "users"), where("groupTagId", "==", d.id))
    )

    tags.push({
      id: d.id,
      name: data.name,
      refId: data.refId,
      companyId: data.companyId,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
      userCount: usersSnap.size
    })
  }

  return tags
}

export async function createGroupTag(
  name: string,
  companyId: string
) {

  const refId = crypto.randomUUID().slice(0,8)

  await addDoc(collection(db,"groupTags"),{
    name,
    refId,
    companyId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
}

export async function updateGroupTag(
  id: string,
  name: string
) {

  await updateDoc(doc(db,"groupTags",id),{
    name,
    updatedAt: serverTimestamp()
  })
}

export async function deleteGroupTag(id:string){

  await deleteDoc(doc(db,"groupTags",id))

}