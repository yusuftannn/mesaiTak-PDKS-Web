import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/constants/collections";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  Announcement,
  AnnouncementDoc,
  CreateAnnouncementParams,
  UpdateAnnouncementParams,
} from "./announcements.types";
import { getCompanyId } from "@/lib/utils/company";

function mapAnnouncement(docId: string, data: AnnouncementDoc): Announcement {
  return {
    id: docId,
    title: data.title,
    message: data.message,
    createdByUid: data.createdByUid ?? null,
    createdByName: data.createdByName ?? null,
    createdAt: data.createdAt ? data.createdAt.toDate() : null,
    updatedAt: data.updatedAt ? data.updatedAt.toDate() : null,
  };
}

export async function createAnnouncement(
  params: CreateAnnouncementParams,
): Promise<string> {
  const companyId = getCompanyId();
  const ref = await addDoc(collection(db, COLLECTIONS.ANNOUNCEMENTS), {
    companyId,
    title: params.title,
    message: params.message,
    createdByUid: params.createdByUid,
    createdByName: params.createdByName,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
}

export async function listAnnouncements(): Promise<Announcement[]> {
  const companyId = getCompanyId(); 
  const q = query(
    collection(db, COLLECTIONS.ANNOUNCEMENTS),
    where("companyId", "==", companyId),
    orderBy("createdAt", "desc"),
  );

  const snap = await getDocs(q);

  return snap.docs.map((doc) =>
    mapAnnouncement(doc.id, doc.data() as AnnouncementDoc),
  );
}

export async function updateAnnouncement(
  announcementId: string,
  params: UpdateAnnouncementParams,
): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.ANNOUNCEMENTS, announcementId), {
    title: params.title,
    message: params.message,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteAnnouncement(
  announcementId: string,
): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.ANNOUNCEMENTS, announcementId));
}
