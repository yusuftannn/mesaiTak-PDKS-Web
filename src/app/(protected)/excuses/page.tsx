"use client";

import { useEffect, useMemo, useState } from "react";
import { useExcuseStore } from "@/features/excuses/excuses.store";
import { useUsersStore } from "@/features/users/users.store";
import { ExcuseType } from "@/features/excuses/excuses.types";

type TypeFilter = "all" | ExcuseType;

function getTypeLabel(type: ExcuseType) {
  return type === "late" ? "Geç Kalma" : "Erken Çıkış";
}

function formatDate(date: Date) {
  return date.toLocaleString("tr-TR");
}

function parseTypeFilter(value: string): TypeFilter {
  if (value === "late" || value === "early") return value;
  return "all";
}

export default function ExcusesPage() {
  const { excuses, loading, fetchExcuses } = useExcuseStore();

  const { users, fetchUsers } = useUsersStore();

  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchExcuses();
    fetchUsers();
  }, [fetchExcuses, fetchUsers]);

  const userMap = useMemo(() => {
    const map = new Map<string, string>();
    users.forEach((u) => map.set(u.uid, u.name));
    return map;
  }, [users]);

  const filtered = useMemo(() => {
    return excuses.filter((e) => {
      const userName = userMap.get(e.userId)?.toLowerCase() || "";

      const matchesSearch =
        e.description.toLowerCase().includes(search.toLowerCase()) ||
        userName.includes(search.toLowerCase());

      const matchesType = typeFilter === "all" || e.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [excuses, search, typeFilter, userMap]);

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">
        Mazeret Kayıtları
      </h1>

      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(parseTypeFilter(e.target.value))}
          className="border rounded-md px-3 py-2 text-sm w-full md:w-auto"
        >
          <option value="all">Tümü</option>
          <option value="late">Geç Kalma</option>
          <option value="early">Erken Çıkış</option>
        </select>

        <input
          placeholder="Ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm w-full md:w-72"
        />
      </div>

      {loading && <p>Yükleniyor...</p>}

      {!loading && filtered.length === 0 && <p>Kayıt bulunamadı</p>}

      <div className="block md:hidden space-y-3">
        {!loading &&
          filtered.map((e) => (
            <div
              key={e.id}
              className="bg-white rounded-xl border p-4 shadow-sm"
            >
              <div className="flex justify-between items-start mb-2">
                <p className="font-semibold text-sm">
                  {userMap.get(e.userId) || "Bilinmiyor"}
                </p>
                <span className="text-xs px-2 py-1 rounded bg-gray-100">
                  {getTypeLabel(e.type)}
                </span>
              </div>

              <p className="text-sm text-gray-700 mb-2">{e.description}</p>

              <div className="text-xs text-gray-500 space-y-1">
                <p>
                  <span className="font-medium">Tarih:</span>{" "}
                  {formatDate(e.date)}
                </p>
                <p>
                  <span className="font-medium">Oluşturulma:</span>{" "}
                  {formatDate(e.createdAt)}
                </p>
              </div>
            </div>
          ))}
      </div>

      <div className="hidden md:block rounded-lg overflow-x-auto">
        {!loading && filtered.length > 0 && (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="p-3">Kullanıcı</th>
                <th className="p-3">Tür</th>
                <th className="p-3">Açıklama</th>
                <th className="p-3">Tarih</th>
                <th className="p-3">Oluşturulma</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((e) => (
                <tr key={e.id} className="bg-white border-t">
                  <td className="p-3 font-medium">
                    {userMap.get(e.userId) || "Bilinmiyor"}
                  </td>

                  <td className="p-3">{getTypeLabel(e.type)}</td>

                  <td className="p-3 max-w-75 truncate">
                    {e.description}
                  </td>

                  <td className="p-3">{formatDate(e.date)}</td>

                  <td className="p-3">{formatDate(e.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
