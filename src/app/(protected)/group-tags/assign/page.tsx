"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/features/auth/auth.store";
import { listUsers, setUserGroupTag } from "@/features/users/users.service";
import { AppUser } from "@/features/users/users.types";
import { GroupTag } from "@/features/group-tags/group-tags.types";
import { listGroupTags } from "@/features/group-tags/group-tags.service";
import MultiTagSelect from "@/components/MultiTagSelect";

export default function AssignGroupPage() {
  const authUser = useAuthStore((s) => s.user);

  const [users, setUsers] = useState<AppUser[]>([]);
  const [tags, setTags] = useState<GroupTag[]>([]);

  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");

  useEffect(() => {
    if (!authUser?.companyId) return;

    async function load() {
      const userList = await listUsers();
      const tagList = await listGroupTags();

      setUsers(userList);
      setTags(tagList);
    }

    load();
  }, [authUser]);

  const handleChange = async (userId: string, values: string[]) => {
    await setUserGroupTag(userId, values);

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, groupTagIds: values } : u)),
    );
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const q = search.toLowerCase();

      const matchesSearch =
        user.name?.toLowerCase().includes(q) ||
        user.email?.toLowerCase().includes(q);

      const matchesTag =
        selectedTag === "all" || user.groupTagIds?.includes(selectedTag);

      return matchesSearch && matchesTag;
    });
  }, [users, search, selectedTag]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Grup Etiketi Atama
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Personellere grup etiketleri atayarak ekip ve departman yönetimini
          kolaylaştırın.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          type="text"
          placeholder="Personel ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:max-w-sm rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-gray-400 focus:ring-4 focus:ring-black/5"
        />

        <select
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
          className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-gray-400 focus:ring-4 focus:ring-black/5"
        >
          <option value="all">Tüm Etiketler</option>

          {tags.map((tag) => (
            <option key={tag.id} value={tag.id}>
              {tag.name}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto overflow-visible">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr className="text-left text-gray-600">
              <th className="p-4 w-16 font-medium">#</th>
              <th className="font-medium">Ad</th>
              <th className="font-medium">Email</th>
              <th className="font-medium">Grup Etiketi</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-14 text-gray-500">
                  Sonuç bulunamadı.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user, i) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-100 last:border-none hover:bg-gray-50/60 transition"
                >
                  <td className="p-4 text-gray-500">{i + 1}</td>

                  <td className="font-medium text-gray-900">{user.name}</td>

                  <td className="text-gray-600">{user.email}</td>

                  <td className="min-w-70 py-3">
                    <MultiTagSelect
                      userTags={user.groupTagIds ?? []}
                      tags={tags}
                      disabled={tags.length === 0}
                      onChange={(values) => handleChange(user.id, values)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
