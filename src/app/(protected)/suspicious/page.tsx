"use client";

import { useEffect, useMemo, useState } from "react";
import { useSuspiciousStore } from "@/features/suspicious/suspicious.store";

type SeverityFilter = "all" | "high" | "medium" | "low";

function getSeverityColor(severity: string) {
  if (severity === "high") return "bg-red-100 text-red-600";
  if (severity === "medium") return "bg-yellow-100 text-yellow-600";
  return "bg-gray-100 text-gray-600";
}

export default function SuspiciousPage() {
  const { logs, loading, fetchLogs } = useSuspiciousStore();

  const [severity, setSeverity] = useState<SeverityFilter>("all");
  const [search, setSearch] = useState<string>("");
  const [sortBy, setSortBy] = useState<"date" | "distance">("date");

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filteredLogs = useMemo(() => {
    let data = [...logs];

    if (search) {
      data = data.filter((l) =>
        l.userName.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (severity !== "all") {
      data = data.filter((l) => l.severity === severity);
    }

    if (sortBy === "distance") {
      data.sort((a, b) => b.distance - a.distance);
    } else {
      data.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    return data;
  }, [logs, search, severity, sortBy]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Şüpheli İşlem Kayıtları</h1>

      <div className="flex flex-wrap gap-3">
        <input
          placeholder="Kullanıcı ara..."
          className="border px-3 py-2 rounded-md text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border px-3 py-2 rounded-md text-sm"
          value={severity}
          onChange={(e) => setSeverity(e.target.value as SeverityFilter)}
        >
          <option value="all">Tüm Seviyeler</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select
          className="border px-3 py-2 rounded-md text-sm"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "date" | "distance")}
        >
          <option value="date">Tarihe göre</option>
          <option value="distance">Mesafeye göre</option>
        </select>
      </div>

      {loading && <p>Yükleniyor...</p>}

      {!loading && filteredLogs.length === 0 && (
        <div className="text-gray-500 text-sm">Kayıt bulunamadı</div>
      )}

      {!loading && filteredLogs.length > 0 && (
        <div className="overflow-x-auto border rounded-xl">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-3 text-left">Kullanıcı</th>
                <th className="p-3 text-left">Şube</th>
                <th className="p-3 text-left">Mesafe</th>
                <th className="p-3 text-left">Severity</th>
                <th className="p-3 text-left">Tarih</th>
              </tr>
            </thead>

            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{log.userName}</td>

                  <td className="p-3 text-gray-500">{log.branchName}</td>

                  <td className="p-3">
                    <span className="text-red-600 font-semibold">
                      {Math.round(log.distance)} m
                    </span>
                    <div className="text-xs text-gray-400">
                      izin: {log.allowedDistance} m
                    </div>
                  </td>

                  <td className="p-3">
                    <span
                      className={`text-xs px-2 py-1 rounded ${getSeverityColor(
                        log.severity,
                      )}`}
                    >
                      {log.severity.toUpperCase()}
                    </span>
                  </td>

                  <td className="p-3 text-gray-400">
                    {log.createdAt.toLocaleString("tr-TR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
