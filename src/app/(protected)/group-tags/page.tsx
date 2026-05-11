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
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "users">("newest");

  useEffect(() => {
    if (!companyId) return;

    fetchTags();
  }, [companyId, fetchTags]);

  const filteredTags = [...tags]
    .filter((tag) => {
      const q = search.toLowerCase();

      return (
        tag.name.toLowerCase().includes(q) ||
        tag.refId.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === "users") {
        return (b.userCount ?? 0) - (a.userCount ?? 0);
      }

      const aTime = a.createdAt?.getTime?.() ?? 0;
      const bTime = b.createdAt?.getTime?.() ?? 0;

      return sortBy === "newest" ? bTime - aTime : aTime - bTime;
    });

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
      <div className="flex justify-between items-start gap-4 mb-6 flex-col sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Grup Etiketleri
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Personelleri kategorilere ayırmak için grup etiketlerini yönetin ve
            düzenleyin.
          </p>
        </div>

        <Button onClick={openCreate} size="md">
          + Yeni Etiket
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          type="text"
          placeholder="Etiket ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:max-w-sm rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-gray-400 focus:ring-4 focus:ring-black/5"
        />

        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value as "newest" | "oldest" | "users")
          }
          className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-gray-400 focus:ring-4 focus:ring-black/5"
        >
          <option value="newest">En Yeni</option>
          <option value="oldest">En Eski</option>
          <option value="users">Kullanıcı Sayısı</option>
        </select>
      </div>

      <div className="overflow-x-auto bg-white rounded-2xl border border-gray-100 shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr className="text-left text-gray-600">
              <th className="p-4 font-medium">#</th>
              <th className="font-medium">Grup Etiket Adı</th>
              <th className="font-medium">Kullanıcı</th>
              <th className="font-medium">Referans ID</th>
              <th className="font-medium">Oluşturma</th>
              <th className="font-medium">Son Düzenleme</th>
              <th className="text-center font-medium">İşlem</th>
            </tr>
          </thead>

          <tbody>
            {filteredTags.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-14 text-gray-500">
                  Sonuç bulunamadı.
                </td>
              </tr>
            ) : (
              filteredTags.map((tag, i) => (
                <tr
                  key={tag.id}
                  className="border-b border-gray-100 last:border-none hover:bg-gray-50/60 transition"
                >
                  <td className="p-4 text-gray-500">{i + 1}</td>

                  <td className="font-medium text-gray-900">{tag.name}</td>

                  <td>
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                      {tag.userCount ?? 0} kullanıcı
                    </span>
                  </td>

                  <td className="font-mono text-xs text-gray-500">
                    {tag.refId}
                  </td>

                  <td className="text-gray-600">
                    {tag.createdAt ? format(tag.createdAt, "dd.MM.yyyy") : "-"}
                  </td>

                  <td className="text-gray-600">
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
