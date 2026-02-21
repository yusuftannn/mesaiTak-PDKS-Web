"use client";
import { Power, UserPlus, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { AppUser, listUsers, updateUser } from "@/lib/db/users";
import { listCompanies, Company } from "@/lib/db/companies";
import { listBranchesByCompany, Branch } from "@/lib/db/branches";
import Button from "@/components/ui/Button";
import CreateUserModal from "./CreateUserModal";
import EditUserModal from "./EditUserModal";

export default function UsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [branches, setBranches] = useState<Record<string, Branch[]>>({});
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [filterRole, setFilterRole] = useState<"" | AppUser["role"]>("");
  const [filterStatus, setFilterStatus] = useState<"" | AppUser["status"]>("");
  const [filterCompany, setFilterCompany] = useState("");
  const [filterBranch, setFilterBranch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);

      const [u, c] = await Promise.all([listUsers(), listCompanies()]);

      if (!mounted) return;

      setUsers(u);
      setCompanies(c);

      const companyIds = Array.from(
        new Set(u.map((x) => x.companyId).filter(Boolean)),
      ) as string[];

      for (const cid of companyIds) {
        const data = await listBranchesByCompany(cid);
        setBranches((prev) => ({
          ...prev,
          [cid]: data,
        }));
      }

      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const loadBranches = async (companyId: string) => {
    if (branches[companyId]) return;

    const data = await listBranchesByCompany(companyId);
    setBranches((prev) => ({
      ...prev,
      [companyId]: data,
    }));
  };

  const onChangeRole = async (userId: string, role: AppUser["role"]) => {
    await updateUser(userId, { role });
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
  };

  const onChangeCompany = async (userId: string, companyId: string) => {
    await updateUser(userId, {
      companyId,
      branchId: null,
    });

    await loadBranches(companyId);

    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              companyId,
              branchId: null,
            }
          : u,
      ),
    );
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

  if (loading) {
    return <div className="p-6">Yükleniyor…</div>;
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());

    const matchesRole = filterRole ? u.role === filterRole : true;
    const matchesStatus = filterStatus ? u.status === filterStatus : true;
    const matchesCompany = filterCompany ? u.companyId === filterCompany : true;
    const matchesBranch = filterBranch ? u.branchId === filterBranch : true;

    return (
      matchesSearch &&
      matchesRole &&
      matchesStatus &&
      matchesCompany &&
      matchesBranch
    );
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6 max-w-7xl">
        <h2 className="text-lg font-semibold">Kullanıcılar</h2>

        <div className="flex gap-2">
          <Button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2"
            icon={<UserPlus size={16} />}
          >
            Kullanıcı Ekle
          </Button>
        </div>
      </div>

      <div className="space-y-4 max-w-7xl">
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
            onChange={(e) => {
              const value = e.target.value;
              setFilterRole(value === "" ? "" : (value as AppUser["role"]));
            }}
            className="border px-3 py-2 rounded-lg text-sm"
          >
            <option value="">Tüm Roller</option>
            <option value="employee">employee</option>
            <option value="admin">admin</option>
            <option value="manager">manager</option>
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
            value={filterCompany}
            onChange={(e) => {
              setFilterCompany(e.target.value);
              setFilterBranch("");
            }}
            className="border px-3 py-2 rounded-lg text-sm"
          >
            <option value="">Tüm Şirketler</option>
            {companies.map((c) => (
              <option key={c.companyId} value={c.companyId}>
                {c.name}
              </option>
            ))}
          </select>

          {filterCompany && (
            <select
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value)}
              className="border px-3 py-2 rounded-lg text-sm"
            >
              <option value="">Tüm Şubeler</option>
              {(branches[filterCompany] ?? []).map((b) => (
                <option key={b.branchId} value={b.branchId}>
                  {b.name}
                </option>
              ))}
            </select>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setSearch("");
              setFilterRole("");
              setFilterStatus("");
              setFilterCompany("");
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
                <tr key={u.id} className="border-t hover:bg-gray-50 transition">
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

                  <td className="p-3 text-center">
                    <select
                      className="border rounded px-2 py-1 text-xs"
                      value={u.companyId ?? ""}
                      onChange={(e) => onChangeCompany(u.id, e.target.value)}
                      disabled={u.status === "passive"}
                    >
                      <option value="">—</option>
                      {companies.map((c) => (
                        <option key={c.companyId} value={c.companyId}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="p-3 text-center">
                    {u.companyId ? (
                      <select
                        className="border rounded px-2 py-1 text-xs"
                        value={u.branchId ?? ""}
                        onChange={(e) => onChangeBranch(u.id, e.target.value)}
                        disabled={u.status === "passive"}
                      >
                        <option value="">—</option>
                        {(branches[u.companyId] ?? []).map((b) => (
                          <option key={b.branchId} value={b.branchId}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-xs text-gray-400">Şirket seç</span>
                    )}
                  </td>

                  <td className="p-3 text-center">
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={<Power size={12} />}
                      className={`mx-auto flex items-center gap-1 justify-center ${
                        u.status === "active"
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                      }`}
                      onClick={() => onToggleStatus(u)}
                    >
                      {u.status}
                    </Button>
                  </td>

                  <td className="p-3 text-center">
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<Pencil size={16} />}
                      className="mx-auto flex items-center gap-1 justify-center"
                      onClick={() => setEditingUser(u)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="p-6 text-sm text-gray-500 text-center">
              Filtreye uygun kullanıcı bulunamadı
            </div>
          )}
        </div>
      </div>

      {showCreate && (
        <CreateUserModal
          companies={companies}
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
          companies={companies}
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
