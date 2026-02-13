"use client";
import { User, Power, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { AppUser, listUsers, updateUser } from "@/lib/db/users";
import { listCompanies, Company } from "@/lib/db/companies";
import { listBranchesByCompany, Branch } from "@/lib/db/branches";
import CreateUserModal from "./CreateUserModal";

export default function UsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [branches, setBranches] = useState<Record<string, Branch[]>>({});
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
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
    <div className="p-6 space-y-6">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <User size={18} />
        Kullanıcılar
      </h2>
      <button
        onClick={() => setShowCreate(true)}
        className="bg-black text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
      >
        <UserPlus size={16} />
        Kullanıcı Ekle
      </button>

      <div className="bg-gray-50 p-4 rounded-xl flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="İsim veya email ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded-lg text-sm w-60"
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

        <button
          onClick={() => {
            setSearch("");
            setFilterRole("");
            setFilterStatus("");
            setFilterCompany("");
            setFilterBranch("");
          }}
          className="text-xs px-3 py-2 bg-gray-200 rounded-lg"
        >
          Temizle
        </button>
      </div>

      <div className="overflow-auto border rounded-xl">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">
                <div className="flex items-center">Kullanıcı</div>
              </th>

              <th className="p-3">
                <div className="flex justify-center items-center">Rol</div>
              </th>

              <th className="p-3">
                <div className="flex justify-center items-center">Şirket</div>
              </th>

              <th className="p-3">
                <div className="flex justify-center items-center">Şube</div>
              </th>

              <th className="p-3">
                <div className="flex justify-center items-center">Durum</div>
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-3">
                  <div className="font-medium">{u.name}</div>
                  <div className="text-xs text-gray-500">{u.email}</div>
                </td>

                <td className="p-3 text-center">
                  {u.role === "manager" ? (
                    <span className="text-xs text-gray-500">manager</span>
                  ) : (
                    <select
                      className="border rounded px-2 py-1"
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
                    className="border rounded px-2 py-1"
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
                      className="border rounded px-2 py-1"
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

                <td className="p-3 text-center flex justify-center">
                  <button
                    onClick={() => onToggleStatus(u)}
                    className={`text-xs px-3 py-1 rounded gap-1 flex  ${
                      u.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    <Power size={12} />
                    {u.status}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
      </div>
    </div>
  );
}
