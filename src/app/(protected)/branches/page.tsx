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
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
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

  const filteredBranches = branches
    .filter((b) => b.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortOrder === "asc") {
        return a.name.localeCompare(b.name);
      }
      return b.name.localeCompare(a.name);
    });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Şubeler</h2>
      </div>

      <div className="bg-gray-50 p-4 rounded-xl max-w-xl space-y-3">
        <div>
          <label className="text-sm text-gray-600">Şirket</label>
          <select
            className="w-full border rounded-lg px-4 py-2 mt-1"
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

        <div className="flex gap-2">
          <input
            className="flex-1 border rounded-lg px-4 py-2"
            placeholder="Yeni şube adı"
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
          />
          <button
            onClick={onCreate}
            className="bg-black text-white px-5 rounded-lg"
          >
            Ekle
          </button>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-xl flex flex-wrap gap-3 items-center max-w-xl">
        <input
          type="text"
          placeholder="Şube ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-4 py-2 rounded-lg text-sm w-60"
        />

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
          className="border px-4 py-2 rounded-lg text-sm"
        >
          <option value="asc">A → Z</option>
          <option value="desc">Z → A</option>
        </select>

        <button
          onClick={() => {
            setSearch("");
            setSortOrder("asc");
          }}
          className="text-xs px-3 py-2 bg-gray-200 rounded-lg"
        >
          Temizle
        </button>

        <div className="ml-auto text-xs text-gray-500">
          Toplam: {filteredBranches.length}
        </div>
      </div>

      {loading ? (
        <div>Yükleniyor…</div>
      ) : (
        <div className="border rounded-xl divide-y max-w-xl">
          {filteredBranches.length === 0 ? (
            <div className="p-6 text-sm text-gray-500">
              Filtreye uygun şube bulunamadı
            </div>
          ) : (
            filteredBranches.map((b) => (
              <div
                key={b.branchId}
                className="p-4 flex items-center justify-between hover:bg-gray-50 transition"
              >
                <div>
                  <div className="font-medium">{b.name}</div>
                  <div className="text-xs text-gray-500">ID: {b.branchId}</div>
                </div>

                <button
                  className="text-red-600 text-sm hover:underline"
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
