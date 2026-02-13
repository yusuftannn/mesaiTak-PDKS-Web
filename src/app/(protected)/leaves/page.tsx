"use client";

import { useEffect, useState } from "react";
import {
  Leave,
  listLeaves,
  approveLeave,
  rejectLeave,
  deleteLeave,
} from "@/lib/db/leaves";
import { listUsers, AppUser } from "@/lib/db/users";
import { LEAVE_TYPES } from "../../../lib/db/constants/leaveTypes";
import { useAuthStore } from "../../../lib/auth/auth.store";
import { LEAVE_STATUS_LABEL } from "../../../lib/db/constants/leaveStatus";

function formatDate(d: Date) {
  return d.toLocaleDateString("tr-TR");
}

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"" | Leave["status"]>("");
  const [filterType, setFilterType] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    (async () => {
      const [l, u] = await Promise.all([listLeaves(), listUsers()]);
      setLeaves(l);
      setUsers(u);
      setLoading(false);
    })();
  }, []);

  const getUserName = (userId: string) =>
    users.find((u) => u.id === userId)?.name ?? "—";

  if (loading) return <div className="p-6">Yükleniyor…</div>;

  const filteredLeaves = leaves
    .filter((l) => {
      const userName = getUserName(l.userId).toLowerCase();

      const matchesSearch = userName.includes(search.toLowerCase());

      const matchesStatus = filterStatus ? l.status === filterStatus : true;

      const matchesType = filterType ? l.type === filterType : true;

      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      if (sortOrder === "desc") {
        return b.startDate.getTime() - a.startDate.getTime();
      }
      return a.startDate.getTime() - b.startDate.getTime();
    });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">İzin Talepleri</h2>
      </div>

      <div className="bg-gray-50 p-4 rounded-xl flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Çalışan ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-4 py-2 rounded-lg text-sm w-60"
        />

        <select
          value={filterStatus}
          onChange={(e) =>
            setFilterStatus(e.target.value as "" | Leave["status"])
          }
          className="border px-4 py-2 rounded-lg text-sm"
        >
          <option value="">Tüm Durumlar</option>
          <option value="beklemede">Beklemede</option>
          <option value="onaylandı">Onaylandı</option>
          <option value="reddedildi">Reddedildi</option>
        </select>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border px-4 py-2 rounded-lg text-sm"
        >
          <option value="">Tüm Türler</option>
          {LEAVE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as "desc" | "asc")}
          className="border px-4 py-2 rounded-lg text-sm"
        >
          <option value="desc">Yeni → Eski</option>
          <option value="asc">Eski → Yeni</option>
        </select>

        <button
          onClick={() => {
            setSearch("");
            setFilterStatus("");
            setFilterType("");
            setSortOrder("desc");
          }}
          className="text-xs px-3 py-2 bg-gray-200 rounded-lg"
        >
          Temizle
        </button>

        <div className="ml-auto text-xs text-gray-500">
          <span>
            Bekleyen: {leaves.filter((l) => l.status === "beklemede").length}
          </span>
          <span>Toplam: {filteredLeaves.length}</span>
        </div>
      </div>

      <div className="overflow-auto border rounded-xl">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Ad Soyad</th>
              <th className="p-3">Tür</th>
              <th className="p-3">Tarih</th>
              <th className="p-3">Durum</th>
              <th className="p-3">Aksiyon</th>
            </tr>
          </thead>

          <tbody>
            {filteredLeaves.map((l) => (
              <tr key={l.id} className="border-t">
                <td className="p-3">{getUserName(l.userId)}</td>

                <td className="p-3 text-center font-medium">
                  {LEAVE_TYPES.find((t) => t.value === l.type)?.label}
                </td>

                <td className="p-3 text-center">
                  {formatDate(l.startDate)} – {formatDate(l.endDate)}
                </td>

                <td className="p-3 text-center">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      l.status === "beklemede"
                        ? "bg-yellow-100 text-yellow-700"
                        : l.status === "onaylandı"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {LEAVE_STATUS_LABEL[l.status]}
                  </span>
                </td>
                <td className="p-3 text-center space-x-2">
                  {l.status === "beklemede" && (
                    <>
                      <button
                        onClick={async () => {
                          if (!user) return;

                          await approveLeave(l.id, user.uid);

                          setLeaves((prev) =>
                            prev.map((x) =>
                              x.id === l.id ? { ...x, status: "onaylandı" } : x,
                            ),
                          );
                        }}
                        className="text-green-600"
                      >
                        Onayla
                      </button>

                      <button
                        onClick={async () => {
                          if (!user) return;

                          const reason = prompt("Red sebebi?");
                          if (!reason) return;

                          await rejectLeave(l.id, user.uid, reason);

                          setLeaves((prev) =>
                            prev.map((x) =>
                              x.id === l.id
                                ? {
                                    ...x,
                                    status: "reddedildi",
                                    rejectReason: reason,
                                  }
                                : x,
                            ),
                          );
                        }}
                        className="text-red-600"
                      >
                        Reddet
                      </button>
                    </>
                  )}

                  {(l.status === "beklemede" || l.status === "reddedildi") && (
                    <button
                      onClick={async () => {
                        if (!confirm("Bu izin silinsin mi?")) return;

                        await deleteLeave(l.id);
                        setLeaves((prev) => prev.filter((x) => x.id !== l.id));
                      }}
                      className="text-gray-500 hover:text-red-600 ml-2"
                    >
                      Sil
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
