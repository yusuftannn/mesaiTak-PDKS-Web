"use client";

import { useEffect, useState } from "react";
import { listCompanies, Company } from "@/lib/db/companies";
import { useToastStore } from "@/lib/ui/toast.store";
import {
  Branch,
  listBranchesByCompany,
  createBranch,
  removeBranch,
  updateBranch,
} from "@/lib/db/branches";
import Button from "@/components/ui/Button";

export default function BranchesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyId, setCompanyId] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchName, setBranchName] = useState("");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState(false);
  const showToast = useToastStore((s) => s.showToast);

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
  }, [companyId, showToast]);

  const onCreate = async () => {
    if (!branchName.trim() || !companyId) {
      showToast({
        type: "info",
        title: "Eksik Bilgi",
        message: "Şube adı boş olamaz.",
      });
      return;
    }

    try {
      await createBranch(companyId, branchName.trim());
      setBranchName("");

      const data = await listBranchesByCompany(companyId);
      setBranches(data);

      showToast({
        type: "success",
        title: "Şube Oluşturuldu",
        message: "Yeni şube başarıyla eklendi.",
      });
    } catch (err) {
      console.error(err);
      showToast({
        type: "error",
        title: "Hata",
        message: "Şube eklenirken hata oluştu.",
      });
    }
  };

  const onRemove = async (branchId: string) => {
    if (!confirm("Şube silinsin mi?")) return;

    try {
      await removeBranch(branchId);

      const data = await listBranchesByCompany(companyId);
      setBranches(data);

      showToast({
        type: "success",
        title: "Şube Silindi",
        message: "Şube başarıyla silindi.",
      });
    } catch (err) {
      console.error(err);
      showToast({
        type: "error",
        title: "Hata",
        message: "Şube silinirken hata oluştu.",
      });
    }
  };

  const onUpdate = async (branchId: string) => {
    if (!editingName.trim()) {
      showToast({
        type: "info",
        title: "Eksik Bilgi",
        message: "Şube adı boş olamaz.",
      });
      return;
    }

    try {
      await updateBranch(branchId, editingName.trim());

      const data = await listBranchesByCompany(companyId);
      setBranches(data);

      setEditingId(null);
      setEditingName("");

      showToast({
        type: "success",
        title: "Güncellendi",
        message: "Şube adı başarıyla güncellendi.",
      });
    } catch (err) {
      console.error(err);
      showToast({
        type: "error",
        title: "Hata",
        message: "Güncelleme sırasında hata oluştu.",
      });
    }
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
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-6">Şubeler</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl">
        <div className="bg-white border rounded-xl p-5 shadow-sm space-y-4 h-fit">
          <h3 className="text-sm font-semibold text-gray-700">Yeni Şube</h3>

          <div>
            <label className="text-xs text-gray-500">Şirket</label>
            <select
              className="w-full border rounded-lg px-4 py-2 mt-1 text-sm"
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

          <input
            className="w-full border rounded-lg px-4 py-2 text-sm"
            placeholder="Yeni şube adı"
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
          />

          <Button fullWidth onClick={onCreate}>
            Şube Ekle
          </Button>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border rounded-xl p-4 shadow-sm flex items-center gap-4">
            <input
              type="text"
              placeholder="Şube ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border px-4 py-2 rounded-lg text-sm flex-1"
            />

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
              className="border px-4 py-2 rounded-lg text-sm"
            >
              <option value="asc">A → Z</option>
              <option value="desc">Z → A</option>
            </select>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearch("");
                setSortOrder("asc");
              }}
            >
              Temizle
            </Button>

            <div className="text-xs text-gray-500 whitespace-nowrap">
              Toplam: {filteredBranches.length}
            </div>
          </div>

          {loading ? (
            <div className="text-sm text-gray-500 p-4">Yükleniyor…</div>
          ) : (
            <div className="bg-white border rounded-xl divide-y shadow-sm">
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
                    <div className="flex-1">
                      {editingId === b.branchId ? (
                        <input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="border px-3 py-1 rounded-lg text-sm w-full"
                        />
                      ) : (
                        <>
                          <div className="font-medium">{b.name}</div>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2 px-2">
                      {editingId === b.branchId ? (
                        <>
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => onUpdate(b.branchId)}
                          >
                            Kaydet
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setEditingId(null);
                              setEditingName("");
                            }}
                          >
                            İptal
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700"
                            onClick={() => {
                              setEditingId(b.branchId);
                              setEditingName(b.name);
                            }}
                          >
                            Düzenle
                          </Button>

                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => onRemove(b.branchId)}
                          >
                            Sil
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
