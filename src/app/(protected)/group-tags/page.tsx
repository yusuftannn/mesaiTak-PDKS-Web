"use client";

import { useEffect, useState } from "react";
import { useGroupTagStore } from "@/features/group-tags/group-tags.store";
import { format } from "date-fns";
import GroupTagModal from "./GroupTagModal";
import { GroupTag } from "@/features/group-tags/group-tags.types";
import { useAuthStore } from "@/features/auth/auth.store";
import Button from "@/components/ui/Button";
import { confirm } from "@/components/ui/Confirm";

export default function GroupTagsPage() {
  const { tags, fetchTags, removeTag, addTag, editTag } = useGroupTagStore();
  const companyId = useAuthStore((s) => s.user?.companyId);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<GroupTag | null>(null);

  useEffect(() => {
    if (!companyId) return;

    fetchTags();
  }, [companyId, fetchTags]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (tag: GroupTag) => {
    setEditing(tag);
    setModalOpen(true);
  };

  const handleSave = async (name: string) => {
    if (!companyId) return;

    if (editing) {
      await editTag(editing.id, name);
    } else {
      await addTag(name);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Grup Etiketleri</h1>

        <Button onClick={openCreate} size="md">
          + Yeni Etiket
        </Button>
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
            {tags.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-500">
                  Henüz grup etiketi yok.
                </td>
              </tr>
            ) : (
              tags.map((tag, i) => (
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
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openEdit(tag)}
                      >
                        Düzenle
                      </Button>

                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          confirm({
                            title: "Etiket silinsin mi?",
                            description: `"${tag.name}" etiketi kalıcı olarak silinecek.`,
                            confirmText: "Sil",
                            cancelText: "Vazgeç",
                            variant: "danger",
                            onConfirm: async () => {
                              await removeTag(tag.id);
                            },
                          });
                        }}
                      >
                        Sil
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
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
