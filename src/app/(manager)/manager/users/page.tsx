"use client";

import { Power, UserPlus, Pencil, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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

import Button from "@/components/ui/Button";
import CreateUserModal from "./CreateUserModal";
import EditUserModal from "./EditUserModal";
import { useAuthStore } from "@/features/auth/auth.store";

export default function UsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);

  const [filterRole, setFilterRole] = useState<"" | AppUser["role"]>("");
  const [filterStatus, setFilterStatus] = useState<"" | AppUser["status"]>("");
  const [filterBranch, setFilterBranch] = useState("");

  const [loading, setLoading] = useState(true);

  const currentUser = useAuthStore((s) => s.user);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);

      const [u, c, b] = await Promise.all([
        listUsers(),
        listCompanies(),
        listBranches(),
      ]);

      if (!mounted) return;

      setUsers(u);
      setCompanies(c);
      setBranches(b);

      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const companyMap = useMemo(() => {
    const map = new Map<string, string>();
    companies.forEach((c) => map.set(c.companyId, c.name));
    return map;
  }, [companies]);

  const getCompanyName = (companyId: string | null) => {
    if (!companyId) return "-";
    return companyMap.get(companyId) ?? companyId;
  };

  const getBranchesByCompany = (companyId: string | null) => {
    if (!companyId) return [];
    return branches.filter((b) => b.companyId === companyId);
  };

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

  const onToggleStatus = async (user: AppUser) => {
    const next = user.status === "active" ? "passive" : "active";

    if (
      !confirm(
        `Kullanıcı ${
          next === "passive" ? "pasife alınsın mı?" : "aktif edilsin mi?"
        }`,
      )
    )
      return;

    await updateUser(user.id, { status: next });

    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: next } : u)),
    );
  };

  const onDeleteUser = async (user: AppUser) => {
    if (!confirm(`${user.name} adlı kullanıcı kalıcı olarak silinsin mi?`))
      return;

    await deleteUser(user.id);

    setUsers((prev) => prev.filter((u) => u.id !== user.id));
  };

  if (loading) {
    return <div className="p-6">Yükleniyor…</div>;
  }

  const headerCompanyName =
    currentUser?.role === "manager"
      ? "Tüm Kullanıcılar"
      : getCompanyName(currentUser?.companyId ?? null);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());

    const matchesRole = filterRole ? u.role === filterRole : true;
    const matchesStatus = filterStatus ? u.status === filterStatus : true;
    const matchesBranch = filterBranch ? u.branchId === filterBranch : true;

    return matchesSearch && matchesRole && matchesStatus && matchesBranch;
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-2xl font-bold">Kullanıcılar</h1>
          <p className="text-sm text-gray-500">
            Tüm kullanıcılar
          </p>
        </div>

        <Button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2"
          icon={<UserPlus size={16} />}
        >
          Kullanıcı Ekle
        </Button>
      </div>

      <div className="space-y-4">
        <div className="bg-white border rounded-xl p-4 shadow-sm flex flex-wrap gap-4 items-center">
          <input
            type="text"
            placeholder="İsim veya email ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-2 rounded-lg text-sm flex-1"
          />

          <select
            value={filterRole}
            onChange={(e) =>
              setFilterRole(
                e.target.value === ""
                  ? ""
                  : (e.target.value as AppUser["role"]),
              )
            }
            className="border px-3 py-2 rounded-lg text-sm"
          >
            <option value="">Tüm Roller</option>
            <option value="employee">employee</option>
            <option value="admin">admin</option>
            <option value="manager">manager</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(
                e.target.value === ""
                  ? ""
                  : (e.target.value as AppUser["status"]),
              )
            }
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

        <div className="bg-white border rounded-xl shadow-sm overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Kullanıcı</th>
                <th className="p-3 text-center">Rol</th>
                <th className="p-3 text-center">Şirket</th>
                <th className="p-3 text-center">Şube</th>
                <th className="p-3 text-center">Durum</th>
                <th className="p-3 text-center">İşlem</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id} className="border-t hover:bg-gray-50">
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
                    {getCompanyName(u.companyId)}
                  </td>

                  <td className="p-3 text-center">
                    <select
                      className="border rounded px-2 py-1 text-xs"
                      value={u.branchId ?? ""}
                      onChange={(e) => onChangeBranch(u.id, e.target.value)}
                      disabled={u.status === "passive"}
                    >
                      <option value="">—</option>
                      {getBranchesByCompany(u.companyId).map((b) => (
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

                  <td className="p-3 text-center flex gap-2 justify-center">
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<Pencil size={16} />}
                      onClick={() => setEditingUser(u)}
                    />

                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Trash2 size={16} />}
                      className="text-red-600 hover:bg-red-100"
                      onClick={() => onDeleteUser(u)}
                    />
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
            setUsers(data);
          }}
        />
      )}

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onUpdated={async () => {
            const data = await listUsers();
            setUsers(data);
          }}
        />
      )}
    </div>
  );
}
