"use client";

import { Power, UserPlus, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  listUsers,
  updateUser,
  deleteUser,
} from "@/features/users/users.service";
import { AppUser } from "@/features/users/users.types";
import { Company } from "@/features/companies/companies.types";
import { listCompanies } from "@/features/companies/companies.service";
import { Branch } from "@/features/branches/branches.types";
import { listBranches } from "@/features/branches/branches.service";
import { getCompanyId } from "@/lib/utils/company";
import { confirm } from "@/components/ui/Confirm";
import { getCompanyLimits } from "@/features/limits/limits.service";
import { listGroupTags } from "@/features/group-tags/group-tags.service";
import { GroupTag } from "@/features/group-tags/group-tags.types";

import Button from "@/components/ui/Button";
import CreateUserModal from "./CreateUserModal";
import EditUserModal from "./EditUserModal";

export default function UsersPage() {
  const companyId = getCompanyId();

  const [users, setUsers] = useState<AppUser[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [userLimit, setUserLimit] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [groupTags, setGroupTags] = useState<GroupTag[]>([]);

  const [filterRole, setFilterRole] = useState<"" | AppUser["role"]>("");
  const [filterStatus, setFilterStatus] = useState<"" | AppUser["status"]>("");
  const [filterBranch, setFilterBranch] = useState("");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);

      const [u, c, b, t] = await Promise.all([
        listUsers(),
        listCompanies(),
        listBranches(),
        listGroupTags(),
      ]);

      if (!mounted) return;

      const filteredUsers = u.filter((x) => x.companyId === companyId);

      setUsers(filteredUsers);
      setCompanies(c);
      setBranches(b);
      setGroupTags(t);

      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [companyId]);

  useEffect(() => {
    async function loadLimits() {
      if (!companyId) return;

      const limits = await getCompanyLimits(companyId);
      setUserLimit(limits.users);
    }

    loadLimits();
  }, [companyId]);

  const onChangeRole = async (userId: string, role: AppUser["role"]) => {
    await updateUser(userId, { role });

    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
  };

  const onChangeBranch = async (userId: string, branchId: string) => {
    await updateUser(userId, { branchId });

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, branchId } : u)),
    );
  };

  const onDeleteUser = (user: AppUser) => {
    confirm({
      title: "Kullanıcı silinsin mi?",
      description: `"${user.name}" kalıcı olarak silinecek. Bu işlem geri alınamaz.`,
      confirmText: "Sil",
      variant: "danger",
      onConfirm: async () => {
        await deleteUser(user.id);

        setUsers((prev) => prev.filter((u) => u.id !== user.id));
      },
    });
  };

  const onToggleStatus = (user: AppUser) => {
    const next = user.status === "active" ? "passive" : "active";

    confirm({
      title:
        next === "passive"
          ? "Kullanıcı pasife alınsın mı?"
          : "Kullanıcı aktif edilsin mi?",
      description: `"${user.name}" kullanıcısının durumu değiştirilecek.`,
      confirmText: "Onayla",
      variant: next === "passive" ? "danger" : "default",
      onConfirm: async () => {
        await updateUser(user.id, { status: next });

        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, status: next } : u)),
        );
      },
    });
  };

  if (loading) {
    return <div className="p-6">Yükleniyor…</div>;
  }

  const companyName =
    companies.find((c) => c.companyId === companyId)?.name ?? "-";

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());

    const matchesRole = filterRole ? u.role === filterRole : true;
    const matchesStatus = filterStatus ? u.status === filterStatus : true;
    const matchesBranch = filterBranch ? u.branchId === filterBranch : true;

    return matchesSearch && matchesRole && matchesStatus && matchesBranch;
  });

  const activeUsersCount = users.filter(
    (u) => u.status === "active" && u.role !== "admin",
  ).length;

  const isLimitReached = userLimit !== null && activeUsersCount >= userLimit;
  const tagMap = new Map(groupTags.map((t) => [t.id, t.name]));
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold">Kullanıcılar</h2>
          {userLimit !== null && (
            <div className="text-xs text-gray-500 mt-1">
              {activeUsersCount} / {userLimit} aktif kullanıcı
            </div>
          )}
        </div>

        <Button
          onClick={() => {
            if (isLimitReached) return;
            setShowCreate(true);
          }}
          disabled={isLimitReached}
          className="flex items-center gap-2"
          icon={<UserPlus size={16} />}
        >
          {isLimitReached ? "Limit dolu" : "Kullanıcı Ekle"}
        </Button>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-xl p-4 shadow-sm flex flex-wrap gap-4 items-center">
          <input
            type="text"
            placeholder="İsim veya email ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-2 rounded-lg text-sm flex-1"
          />

          <select
            value={filterRole}
            onChange={(e) => {
              const value = e.target.value;
              setFilterRole(value === "" ? "" : (value as AppUser["role"]));
            }}
            className="border px-3 py-2 rounded-lg text-sm"
          >
            <option value="">Tüm Roller</option>
            <option value="employee">employee</option>
            <option value="admin">admin</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => {
              const value = e.target.value;
              setFilterStatus(value === "" ? "" : (value as AppUser["status"]));
            }}
            className="border px-3 py-2 rounded-lg text-sm"
          >
            <option value="">Tüm Durumlar</option>
            <option value="active">active</option>
            <option value="passive">passive</option>
          </select>

          <select
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
            className="border px-3 py-2 rounded-lg text-sm"
          >
            <option value="">Tüm Şubeler</option>
            {branches.map((b) => (
              <option key={b.branchId} value={b.branchId}>
                {b.name}
              </option>
            ))}
          </select>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setSearch("");
              setFilterRole("");
              setFilterStatus("");
              setFilterBranch("");
            }}
          >
            Temizle
          </Button>

          <div className="text-xs text-gray-500 whitespace-nowrap">
            Toplam: {filteredUsers.length}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Kullanıcı</th>
                <th className="p-3 text-center">Rol</th>
                <th className="p-3 text-center">Şirket</th>
                <th className="p-3 text-center">Şube</th>
                <th className="p-3 text-center">Gruplar</th>
                <th className="p-3 text-center">Etiket</th>
                <th className="p-3 text-center">İşlem</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id} className=" hover:bg-gray-50">
                  <td className="p-3">
                    <div className="font-medium">{u.name}</div>
                    <div className="text-xs text-gray-500">{u.email}</div>
                  </td>

                  <td className="p-3 text-center">
                    {u.role === "manager" ? (
                      <span className="text-xs text-gray-500">manager</span>
                    ) : (
                      <select
                        className="border rounded px-2 py-1 text-xs"
                        value={u.role}
                        onChange={(e) =>
                          onChangeRole(u.id, e.target.value as AppUser["role"])
                        }
                      >
                        <option value="employee">employee</option>
                        <option value="admin">admin</option>
                      </select>
                    )}
                  </td>

                  <td className="p-3 text-center text-xs text-gray-600">
                    {companyName}
                  </td>

                  <td className="p-3 text-center">
                    <select
                      className="border rounded px-2 py-1 text-xs"
                      value={u.branchId ?? ""}
                      onChange={(e) => onChangeBranch(u.id, e.target.value)}
                      disabled={u.status === "passive"}
                    >
                      <option value="">—</option>
                      {branches.map((b) => (
                        <option key={b.branchId} value={b.branchId}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="p-3 text-center">
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={<Power size={12} />}
                      className={`mx-auto flex items-center gap-1 justify-center ${
                        u.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                      onClick={() => onToggleStatus(u)}
                    >
                      {u.status}
                    </Button>
                  </td>

                  <td className="p-3 text-center">
                    <div className="flex flex-wrap gap-1 justify-center">
                      {(u.groupTagIds ?? []).map((tagId) => (
                        <span
                          key={tagId}
                          className="text-[10px] px-2 py-1 rounded-full bg-blue-100 text-blue-700"
                        >
                          {tagMap.get(tagId) ?? "?"}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<Pencil size={16} />}
                        onClick={() => setEditingUser(u)}
                      />

                      {u.role !== "manager" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Trash2 size={16} />}
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => onDeleteUser(u)}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="p-6 text-sm text-gray-500 text-center">
              Kullanıcı bulunamadı
            </div>
          )}
        </div>
      </div>

      {showCreate && (
        <CreateUserModal
          onClose={() => setShowCreate(false)}
          onCreated={async () => {
            const data = await listUsers();
            setUsers(data.filter((x) => x.companyId === companyId));
          }}
        />
      )}

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onUpdated={async () => {
            const data = await listUsers();
            setUsers(data.filter((x) => x.companyId === companyId));
          }}
        />
      )}
    </div>
  );
}
