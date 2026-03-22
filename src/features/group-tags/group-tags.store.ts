import { create } from "zustand";
import { GroupTag } from "@/features/group-tags/group-tags.types";
import {
  listGroupTags,
  createGroupTag,
  updateGroupTag,
  deleteGroupTag,
} from "@/features/group-tags/group-tags.service";

interface GroupTagStore {
  tags: GroupTag[];

  fetchTags: () => Promise<void>;
  addTag: (name: string) => Promise<void>;
  editTag: (id: string, name: string) => Promise<void>;
  removeTag: (id: string) => Promise<void>;
}

export const useGroupTagStore = create<GroupTagStore>((set, get) => ({
  tags: [],

  fetchTags: async () => {
    const data = await listGroupTags();
    set({ tags: data });
  },

  addTag: async (name) => {
    await createGroupTag(name);
    await get().fetchTags();
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
