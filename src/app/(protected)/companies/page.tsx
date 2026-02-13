"use client";

import { useEffect, useState } from "react";
import {
  Company,
  createCompany,
  listCompanies,
  removeCompany,
} from "@/lib/db/companies";

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [name, setName] = useState("");
  const [country, setCountry] = useState("TR");
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
    <div className="p-6 space-y-6">
      <h2 className="text-lg font-semibold">Şirketler</h2>

      <div className="bg-gray-50 p-4 rounded-xl space-y-3 max-w-3xl">
        <div className="flex flex-wrap gap-3">
          <input
            className="flex-1 border rounded-lg px-4 py-2"
            placeholder="Şirket adı"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <select
            className="border rounded-lg px-4 py-2"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          >
            <option value="TR">Türkiye</option>
            <option value="US">USA</option>
            <option value="DE">Germany</option>
          </select>

          <button
            onClick={onCreate}
            className="bg-black text-white px-6 rounded-lg"
          >
            Ekle
          </button>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-xl flex flex-wrap gap-3 items-center max-w-3xl">
        <input
          type="text"
          placeholder="Şirket ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-4 py-2 rounded-lg text-sm w-60"
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
          className="text-xs px-3 py-2 bg-gray-200 rounded-lg"
        >
          Temizle
        </button>

        <div className="ml-auto text-xs text-gray-500">
          Toplam: {filteredCompanies.length}
        </div>
      </div>

      <div className="border rounded-xl divide-y max-w-3xl">
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

              <button
                className="text-red-600 text-sm hover:underline"
                onClick={() => onRemove(c.companyId)}
              >
                Sil
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
