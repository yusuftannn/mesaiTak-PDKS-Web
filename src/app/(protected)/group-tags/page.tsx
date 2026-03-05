"use client";

import { useEffect, useState } from "react";
import { useGroupTagStore } from "@/lib/store/groupTag.store";
import { format } from "date-fns";
import GroupTagModal from "./GroupTagModal";
import { GroupTag } from "@/types/groupTag";

export default function GroupTagsPage() {
  const { tags, fetchTags, removeTag, addTag, editTag } = useGroupTagStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<GroupTag | null>(null);

  const companyId = "demoCompany";

  useEffect(() => {
    fetchTags(companyId);
  }, []);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (tag: GroupTag) => {
    setEditing(tag);
    setModalOpen(true);
  };

  const handleSave = async (name: string) => {
    if (editing) {
      await editTag(editing.id, name);
    } else {
      await addTag(name, companyId);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Grup Etiketleri</h1>

        <button
          onClick={openCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Yeni Etiket
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="p-3">#</th>
              <th>Grup Etiket Adı</th>
              <th>Kullanıcı</th>
              <th>Referans ID</th>
              <th>Oluşturma</th>
              <th>Son Düzenleme</th>
              <th className="text-center">İşlem</th>
            </tr>
          </thead>

          <tbody>
            {tags.map((tag, i) => (
              <tr key={tag.id} className="border-t">
                <td className="p-3">{i + 1}</td>

                <td>{tag.name}</td>

                <td>{tag.userCount ?? 0}</td>

                <td className="font-mono text-xs">{tag.refId}</td>

                <td>
                  {tag.createdAt ? format(tag.createdAt, "dd.MM.yyyy") : "-"}
                </td>

                <td>
                  {tag.updatedAt ? format(tag.updatedAt, "dd.MM.yyyy") : "-"}
                </td>

                <td>
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => openEdit(tag)}
                      className="px-3 py-1 text-xs bg-blue-500 text-white rounded"
                    >
                      Düzenle
                    </button>

                    <button
                      onClick={() => removeTag(tag.id)}
                      className="px-3 py-1 text-xs bg-red-500 text-white rounded"
                    >
                      Sil
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <GroupTagModal
        key={editing?.id ?? "create"}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initial={editing}
      />
    </div>
  );
}
