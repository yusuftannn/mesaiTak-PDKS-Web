import { create } from "zustand";
import { GroupTag } from "@/types/groupTag";
import {
  listGroupTags,
  createGroupTag,
  updateGroupTag,
  deleteGroupTag,
} from "@/lib/services/groupTag.service";

interface GroupTagStore {
  tags: GroupTag[];

  fetchTags: (companyId: string) => Promise<void>;

  addTag: (name: string, companyId: string) => Promise<void>;

  editTag: (id: string, name: string) => Promise<void>;

  removeTag: (id: string) => Promise<void>;
}

export const useGroupTagStore = create<GroupTagStore>((set, get) => ({
  tags: [],

  fetchTags: async (companyId) => {
    const data = await listGroupTags(companyId);

    set({ tags: data });
  },

  addTag: async (name, companyId) => {
    await createGroupTag(name, companyId);

    await get().fetchTags(companyId);
  },

  editTag: async (id, name) => {
    await updateGroupTag(id, name);

    set((state) => ({
      tags: state.tags.map((t) => (t.id === id ? { ...t, name } : t)),
    }));
  },

  removeTag: async (id) => {
    await deleteGroupTag(id);

    set((state) => ({
      tags: state.tags.filter((t) => t.id !== id),
    }));
  },
}));
