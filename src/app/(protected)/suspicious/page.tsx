"use client";

import { useEffect } from "react";
import { useSuspiciousStore } from "@/features/suspicious/suspicious.store";

function getSeverityColor(severity: string) {
  if (severity === "high") return "bg-red-100 text-red-600";
  if (severity === "medium") return "bg-yellow-100 text-yellow-600";
  return "bg-gray-100 text-gray-600";
}

export default function SuspiciousPage() {
  const { logs, loading, fetchLogs } = useSuspiciousStore();

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Şüpheli İşlem Kayıtları</h1>
      </div>

      {loading && <p>Yükleniyor...</p>}

      {!loading && logs.length === 0 && (
        <div className="text-gray-500 text-sm">Şüpheli işlem bulunamadı</div>
      )}

      <div className="space-y-4">
        {logs.map((log) => (
          <div
            key={log.id}
            className="border rounded-xl p-4 shadow-sm hover:shadow-md transition"
          >
            <div className="flex justify-between items-center">
              <div className="font-medium">{log.userName}</div>

              {/* 🔥 severity badge */}
              <span
                className={`text-xs px-2 py-1 rounded ${getSeverityColor(
                  log.severity,
                )}`}
              >
                {log.severity.toUpperCase()}
              </span>
            </div>

            <div className="text-sm text-gray-500 mt-1">
              Şube: {log.branchName}
            </div>

            <div className="text-sm mt-3">
              📏 Mesafe:{" "}
              <span className="text-red-600 font-semibold">
                {Math.round(log.distance)} m
              </span>
              {" / "}
              izin verilen: {log.allowedDistance} m
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-gray-400">
              <div>
                Kullanıcı: {log.userLat.toFixed(4)}, {log.userLng.toFixed(4)}
              </div>
              <div>
                Şube: {log.branchLat.toFixed(4)}, {log.branchLng.toFixed(4)}
              </div>
            </div>

            <div className="text-xs text-gray-400 mt-3">
              {log.createdAt.toLocaleString("tr-TR")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
