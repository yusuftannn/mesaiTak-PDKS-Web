"use client";

import { useEffect, useState } from "react";
import {
  Company,
  createCompany,
  listCompanies,
  removeCompany,
  updateCompany,
} from "@/lib/db/companies";

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [name, setName] = useState("");
  const [country, setCountry] = useState("TR");
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [search, setSearch] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      const data = await listCompanies();
      if (mounted) {
        setCompanies(data);
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const onCreate = async () => {
    if (!name.trim()) return;

    await createCompany(name.trim(), country);
    setName("");
    setCountry("TR");

    const data = await listCompanies();
    setCompanies(data);
  };

  const onRemove = async (companyId: string) => {
    if (!confirm("Şirket silinsin mi?")) return;

    await removeCompany(companyId);

    const data = await listCompanies();
    setCompanies(data);
  };

  const onUpdate = async () => {
    if (!editingCompany) return;
    if (!name.trim()) return;

    await updateCompany(editingCompany.companyId, {
      name: name.trim(),
      country,
    });

    setEditingCompany(null);
    setName("");
    setCountry("TR");

    const data = await listCompanies();
    setCompanies(data);
  };

  const filteredCompanies = companies
    .filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());

      const matchesCountry = filterCountry ? c.country === filterCountry : true;

      return matchesSearch && matchesCountry;
    })
    .sort((a, b) => {
      if (sortOrder === "asc") {
        return a.name.localeCompare(b.name);
      }
      return b.name.localeCompare(a.name);
    });

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse text-sm text-gray-500">
          Şirketler yükleniyor...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-6">Şirketler</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl">
        <div className="bg-white border rounded-xl p-5 shadow-sm space-y-4 h-fit">
          <h3 className="text-sm font-semibold text-gray-700">
            {editingCompany ? "Şirket Güncelle" : "Yeni Şirket"}
          </h3>

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

          <button
            onClick={editingCompany ? onUpdate : onCreate}
            className="w-full bg-black text-white py-2 rounded-lg text-sm hover:opacity-90 transition"
          >
            {editingCompany ? "Güncelle" : "Şirket Ekle"}
          </button>
          {editingCompany && (
            <button
              onClick={() => {
                setEditingCompany(null);
                setName("");
                setCountry("TR");
              }}
              className="w-full bg-gray-200 text-sm py-2 rounded-lg hover:bg-gray-300 transition"
            >
              İptal
            </button>
          )}
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

            <button
              onClick={() => {
                setSearch("");
                setFilterCountry("");
                setSortOrder("asc");
              }}
              className="text-xs px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition whitespace-nowrap"
            >
              Temizle
            </button>

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
                  key={c.id}
                  className="p-4 flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <div>
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-gray-500">
                      ID: {c.companyId} • Ülke: {c.country}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      className="text-blue-600 text-sm hover:underline"
                      onClick={() => {
                        setEditingCompany(c);
                        setName(c.name);
                        setCountry(c.country);
                      }}
                    >
                      Düzenle
                    </button>

                    <button
                      className="text-red-600 text-sm hover:underline"
                      onClick={() => onRemove(c.companyId)}
                    >
                      Sil
                    </button>
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
