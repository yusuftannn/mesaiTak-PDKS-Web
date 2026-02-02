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

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-lg font-semibold">Şirketler</h2>

      <div className="flex flex-wrap gap-2 max-w-xl">
        <input
          className="flex-1 border rounded-lg p-3"
          placeholder="Şirket adı"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <select
          className="border rounded-lg p-3"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        >
          <option value="TR">Türkiye</option>
          <option value="US">USA</option>
          <option value="DE">Germany</option>
        </select>

        <button
          onClick={onCreate}
          className="bg-black text-white rounded-lg px-6"
        >
          Ekle
        </button>
      </div>

      {loading ? (
        <div>Yükleniyor…</div>
      ) : (
        <div className="border rounded-xl divide-y max-w-xl">
          {companies.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">Henüz şirket yok</div>
          ) : (
            companies.map((c) => (
              <div key={c.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-gray-500">
                    {c.companyId} • {c.country}
                  </div>
                </div>

                <button
                  className="text-red-600 text-sm"
                  onClick={() => onRemove(c.companyId)}
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
