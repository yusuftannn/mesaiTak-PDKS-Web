"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/auth/auth.store";
import { listUsersByCompany, setUserGroupTag, AppUser } from "@/lib/db/users";
import { GroupTag } from "@/types/groupTag";
import { listGroupTags } from "@/lib/services/groupTag.service";
import MultiTagSelect from "@/components/MultiTagSelect";

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

  const handleChange = async (userId: string, values: string[]) => {
    await setUserGroupTag(userId, values);

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, groupTagIds: values } : u)),
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Grup Etiketi Atama</h1>

      <div className="bg-white border rounded-xl overflow-visible">
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
                  <MultiTagSelect
                    userTags={user.groupTagIds ?? []}
                    tags={tags}
                    onChange={(values) => handleChange(user.id, values)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
