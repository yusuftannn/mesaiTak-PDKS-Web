"use client";

import { useEffect, useState } from "react";
import { listCompanies, Company } from "@/lib/db/companies";
import {
  Branch,
  listBranchesByCompany,
  createBranch,
  removeBranch,
} from "@/lib/db/branches";

export default function BranchesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyId, setCompanyId] = useState<string>("");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchName, setBranchName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const data = await listCompanies();
      if (!mounted) return;

      setCompanies(data);

      if (data.length > 0) {
        setCompanyId(data[0].companyId);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!companyId) {
        setBranches([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const data = await listBranchesByCompany(companyId);
        if (mounted) setBranches(data);
      } catch (e: unknown) {
        console.error("listBranchesByCompany failed:", e);
        if (mounted) setBranches([]);
        alert("Şubeler yüklenemedi. Console hatasını kontrol et.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [companyId]);

  const onCreate = async () => {
    if (!branchName.trim() || !companyId) return;

    await createBranch(companyId, branchName.trim());
    setBranchName("");

    const data = await listBranchesByCompany(companyId);
    setBranches(data);
  };

  const onRemove = async (branchId: string) => {
    if (!confirm("Şube silinsin mi?")) return;

    await removeBranch(branchId);

    const data = await listBranchesByCompany(companyId);
    setBranches(data);
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-lg font-semibold">Şubeler</h2>

      <div className="max-w-sm">
        <label className="text-sm text-gray-600">Şirket</label>
        <select
          className="w-full border rounded-lg p-3 mt-1"
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
        >
          {companies.map((c) => (
            <option key={c.companyId} value={c.companyId}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 max-w-md">
        <input
          className="flex-1 border rounded-lg p-3"
          placeholder="Yeni şube adı"
          value={branchName}
          onChange={(e) => setBranchName(e.target.value)}
        />
        <button
          onClick={onCreate}
          className="bg-black text-white rounded-lg px-4"
        >
          Ekle
        </button>
      </div>

      {loading ? (
        <div>Yükleniyor…</div>
      ) : (
        <div className="border rounded-xl divide-y max-w-md">
          {branches.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">
              Bu şirkete ait şube yok
            </div>
          ) : (
            branches.map((b) => (
              <div
                key={b.branchId}
                className="p-4 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium">{b.name}</div>
                  <div className="text-xs text-gray-500">{b.branchId}</div>
                </div>
                <button
                  className="text-red-600 text-sm"
                  onClick={() => onRemove(b.branchId)}
                >
                  Sil
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
