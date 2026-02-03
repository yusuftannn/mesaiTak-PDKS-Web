"use client";

import { useEffect, useState } from "react";
import { AppUser, listUsers, updateUser } from "@/lib/db/users";
import { listCompanies, Company } from "@/lib/db/companies";
import { listBranchesByCompany, Branch } from "@/lib/db/branches";

export default function UsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [branches, setBranches] = useState<Record<string, Branch[]>>({});

  useEffect(() => {
    let mounted = true;

    (async () => {
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
    await updateUser(userId, { companyId, branchId: null });
    await loadBranches(companyId);

    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, companyId, branchId: null } : u,
      ),
    );
  };

  const onChangeBranch = async (userId: string, branchId: string) => {
    await updateUser(userId, { branchId });

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, branchId } : u)),
    );
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-lg font-semibold">Kullanıcılar</h2>

      <div className="overflow-auto border rounded-xl">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3">Ad</th>
              <th className="p-3">Rol</th>
              <th className="p-3">Şirket</th>
              <th className="p-3">Şube</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t text-center">
                <td className="p-3 font-medium">{u.name}</td>

                <td className="p-3">
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

                <td className="p-3">
                  <select
                    className="border rounded px-2 py-1"
                    value={u.companyId ?? ""}
                    onChange={(e) => onChangeCompany(u.id, e.target.value)}
                  >
                    <option value="">—</option>
                    {companies.map((c) => (
                      <option key={c.companyId} value={c.companyId}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="p-3">
                  {u.companyId ? (
                    <select
                      className="border rounded px-2 py-1"
                      value={u.branchId ?? ""}
                      onChange={(e) => onChangeBranch(u.id, e.target.value)}
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
