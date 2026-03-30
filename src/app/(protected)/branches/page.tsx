"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import { useToastStore } from "@/lib/ui/toast.store";
import { useAuthStore } from "@/features/auth/auth.store";
import { useBranchesStore } from "@/features/branches/branches.store";

export default function BranchesPage() {
  const showToast = useToastStore((s) => s.showToast);

  const companyId = useAuthStore((s) => s.user?.companyId);

  const {
    branches,
    fetchBranches,
    createBranch,
    updateBranch,
    deleteBranch,
    loading,
  } = useBranchesStore();

  const [branchName, setBranchName] = useState("");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

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
      await createBranch(branchName);
      setBranchName("");

      showToast({
        type: "success",
        title: "Şube Oluşturuldu",
      });
    } catch (error) {
      console.log("createBranch error:", error);
      showToast({
        type: "error",
        title: "Hata",
        message: "Şube eklenemedi",
      });
    }
  };

  const onRemove = async (branchId: string) => {
    if (!confirm("Şube silinsin mi?")) return;

    try {
      await deleteBranch(branchId);

      showToast({
        type: "success",
        title: "Şube Silindi",
      });
    } catch {
      showToast({
        type: "error",
        title: "Hata",
        message: "Silme başarısız",
      });
    }
  };

  const onUpdate = async (branchId: string) => {
    if (!editingName.trim()) return;

    try {
      await updateBranch(branchId, editingName.trim());

      setEditingId(null);
      setEditingName("");

      showToast({
        type: "success",
        title: "Güncellendi",
      });
    } catch {
      showToast({
        type: "error",
        title: "Hata",
        message: "Güncellenemedi",
      });
    }
  };

  const filtered = branches
    .filter((b) => b.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) =>
      sortOrder === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name),
    );

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-6">Şubeler</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl">
        <div className="bg-white border rounded-xl p-5 shadow-sm space-y-4 h-fit">
          <h3 className="text-sm font-semibold text-gray-700">Yeni Şube</h3>

          <input
            className="w-full border rounded-lg px-4 py-2 text-sm"
            placeholder="Şube adı"
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
              placeholder="Ara..."
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
              size="sm"
              variant="secondary"
              onClick={() => {
                setSearch("");
                setSortOrder("asc");
              }}
            >
              Temizle
            </Button>

            <div className="text-xs text-gray-500">{filtered.length}</div>
          </div>

          {loading ? (
            <div className="p-4 text-sm text-gray-500">Yükleniyor…</div>
          ) : filtered.length === 0 ? (
            <div className="bg-white border rounded-xl p-8 text-center text-sm text-gray-500">
              Eklenmiş Şube bulunmamaktadır.
            </div>
          ) : (
            <div className="bg-white border rounded-xl divide-y">
              {filtered.map((b) => (
                <div
                  key={b.branchId}
                  className="p-4 flex justify-between items-center"
                >
                  <div className="flex-1">
                    {editingId === b.branchId ? (
                      <input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="border px-3 py-1 rounded-lg text-sm w-full"
                      />
                    ) : (
                      <div className="font-medium">{b.name}</div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {editingId === b.branchId ? (
                      <>
                        <Button size="sm" onClick={() => onUpdate(b.branchId)}>
                          Kaydet
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setEditingId(null)}
                        >
                          İptal
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingId(b.branchId);
                            setEditingName(b.name);
                          }}
                        >
                          Düzenle
                        </Button>

                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => onRemove(b.branchId)}
                        >
                          Sil
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
