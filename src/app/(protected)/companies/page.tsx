"use client";

import { useEffect, useState } from "react";
import { useToastStore } from "@/lib/ui/toast.store";
import {
  Company,
  createCompany,
  listCompanies,
  removeCompany,
  updateCompany,
} from "@/lib/db/companies";
import Button from "@/components/ui/Button";

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [name, setName] = useState("");
  const [country, setCountry] = useState("TR");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingCountry, setEditingCountry] = useState("TR");
  const [search, setSearch] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [loading, setLoading] = useState(true);

  const showToast = useToastStore((s) => s.showToast);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const data = await listCompanies();
        if (mounted) setCompanies(data);
      } catch (err) {
        console.error(err);
        showToast({
          type: "error",
          title: "Veri Hatası",
          message: "Şirketler yüklenemedi.",
        });
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [showToast]);

  const refresh = async () => {
    const data = await listCompanies();
    setCompanies(data);
  };

  const onCreate = async () => {
    if (!name.trim()) {
      showToast({
        type: "info",
        title: "Eksik Bilgi",
        message: "Şirket adı boş olamaz.",
      });
      return;
    }

    try {
      await createCompany(name.trim(), country);

      setName("");
      setCountry("TR");

      await refresh();

      showToast({
        type: "success",
        title: "Şirket Oluşturuldu",
        message: "Yeni şirket başarıyla eklendi.",
      });
    } catch (err) {
      console.error(err);
      showToast({
        type: "error",
        title: "Hata",
        message: "Şirket eklenirken hata oluştu.",
      });
    }
  };

  const onRemove = async (companyId: string) => {
    if (!confirm("Şirket silinsin mi?")) return;

    try {
      await removeCompany(companyId);
      await refresh();

      showToast({
        type: "success",
        title: "Şirket Silindi",
        message: "Şirket başarıyla silindi.",
      });
    } catch (err) {
      console.error(err);
      showToast({
        type: "error",
        title: "Hata",
        message: "Şirket silinirken hata oluştu.",
      });
    }
  };

  const onUpdate = async (companyId: string) => {
    if (!editingName.trim()) {
      showToast({
        type: "info",
        title: "Eksik Bilgi",
        message: "Şirket adı boş olamaz.",
      });
      return;
    }

    try {
      await updateCompany(companyId, {
        name: editingName.trim(),
        country: editingCountry,
      });

      setEditingId(null);
      setEditingName("");
      setEditingCountry("TR");

      await refresh();

      showToast({
        type: "success",
        title: "Güncellendi",
        message: "Şirket başarıyla güncellendi.",
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

  const filteredCompanies = companies
    .filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());

      const matchesCountry = filterCountry ? c.country === filterCountry : true;

      return matchesSearch && matchesCountry;
    })
    .sort((a, b) =>
      sortOrder === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name),
    );

  if (loading) {
    return (
      <div className="p-6 text-sm text-gray-500">Şirketler yükleniyor...</div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-6">Şirketler</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl">
        <div className="bg-white border rounded-xl p-5 shadow-sm space-y-4 h-fit">
          <h3 className="text-sm font-semibold text-gray-700">Yeni Şirket</h3>

          <input
            className="w-full border rounded-lg px-4 py-2 text-sm"
            placeholder="Şirket adı"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <select
            className="w-full border rounded-lg px-4 py-2 text-sm"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          >
            <option value="TR">Türkiye</option>
            <option value="US">USA</option>
            <option value="DE">Germany</option>
          </select>

          <Button fullWidth onClick={onCreate}>
            Şirket Ekle
          </Button>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border rounded-xl p-4 shadow-sm flex items-center gap-4">
            <input
              type="text"
              placeholder="Şirket ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border px-4 py-2 rounded-lg text-sm flex-1"
            />

            <select
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
              className="border px-4 py-2 rounded-lg text-sm"
            >
              <option value="">Tüm Ülkeler</option>
              <option value="TR">Türkiye</option>
              <option value="US">USA</option>
              <option value="DE">Germany</option>
            </select>

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
                setFilterCountry("");
                setSortOrder("asc");
              }}
            >
              Temizle
            </Button>

            <div className="text-xs text-gray-500 whitespace-nowrap">
              Toplam: {filteredCompanies.length}
            </div>
          </div>

          <div className="bg-white border rounded-xl divide-y shadow-sm">
            {filteredCompanies.length === 0 ? (
              <div className="p-6 text-sm text-gray-500">
                Filtreye uygun şirket bulunamadı
              </div>
            ) : (
              filteredCompanies.map((c) => (
                <div
                  key={c.companyId}
                  className="p-4 flex items-center justify-between transition"
                >
                  <div className="flex-1">
                    {editingId === c.companyId ? (
                      <div className="flex gap-3">
                        <input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="border px-3 py-2 rounded-lg text-sm flex-1"
                        />

                        <select
                          value={editingCountry}
                          onChange={(e) => setEditingCountry(e.target.value)}
                          className="border px-3 py-2 rounded-lg text-sm w-32"
                        >
                          <option value="TR">TR</option>
                          <option value="US">US</option>
                          <option value="DE">DE</option>
                        </select>
                      </div>
                    ) : (
                      <>
                        <div className="font-medium">{c.name}</div>
                        <div className="text-xs text-gray-500">
                          Ülke: {c.country}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2 px-2">
                    {editingId === c.companyId ? (
                      <>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => onUpdate(c.companyId)}
                        >
                          Kaydet
                        </Button>

                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setEditingId(null);
                            setEditingName("");
                            setEditingCountry("TR");
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
                            setEditingId(c.companyId);
                            setEditingName(c.name);
                            setEditingCountry(c.country);
                          }}
                        >
                          Düzenle
                        </Button>

                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => onRemove(c.companyId)}
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
        </div>
      </div>
    </div>
  );
}
