"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/auth/auth.store";
import { listUsersByCompany, setUserGroupTag, AppUser } from "@/lib/db/users";
import { GroupTag } from "@/types/groupTag";
import { listGroupTags } from "@/lib/services/groupTag.service";

export default function AssignGroupPage() {
  const authUser = useAuthStore((s) => s.user);

  const [users, setUsers] = useState<AppUser[]>([]);
  const [tags, setTags] = useState<GroupTag[]>([]);

  useEffect(() => {
    if (!authUser?.companyId) return;

    const companyId = authUser.companyId;

    async function load() {
      const userList = await listUsersByCompany(companyId);
      const tagList = await listGroupTags(companyId);

      setUsers(userList);
      setTags(tagList);
    }

    load();
  }, [authUser]);

  const handleChange = async (userId: string, groupTagId: string | null) => {
    await setUserGroupTag(userId, groupTagId);

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, groupTagId } : u)),
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Grup Etiketi Atama</h1>

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="p-3 w-[60px]">#</th>
              <th>Ad</th>
              <th>Email</th>
              <th>Grup Etiketi</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user, i) => (
              <tr key={user.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{i + 1}</td>

                <td>{user.name}</td>

                <td className="text-gray-600">{user.email}</td>

                <td>
                  <select
                    value={user.groupTagId ?? ""}
                    onChange={(e) => {
                      const val = e.target.value;

                      handleChange(user.id, val === "" ? null : val);
                    }}
                    className="border rounded px-2 py-1"
                  >
                    <option value="">Grup Yok</option>

                    {tags.map((tag) => (
                      <option key={tag.id} value={tag.id}>
                        {tag.name}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
