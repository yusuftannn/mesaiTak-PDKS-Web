"use client";

import { useEffect, useState } from "react";
import {
  Leave,
  listLeaves,
  approveLeave,
  rejectLeave,
  deleteLeave,
} from "@/lib/db/leaves";
import { useToastStore } from "@/lib/ui/toast.store";
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
  const showToast = useToastStore((s) => s.showToast);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const [l, u] = await Promise.all([listLeaves(), listUsers()]);

        if (!mounted) return;

        setLeaves(l);
        setUsers(u);
      } catch (err) {
        console.error(err);
        showToast({
          type: "error",
          title: "Veri Hatası",
          message: "İzin talepleri yüklenemedi.",
        });
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [showToast]);

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
    <div className="p-6">
      <div className="flex items-center justify-between mb-6 max-w-7xl">
        <h2 className="text-lg font-semibold">İzin Talepleri</h2>
      </div>

      <div className="space-y-4 max-w-7xl">
        <div className="bg-white border rounded-xl p-4 shadow-sm flex flex-wrap gap-4 items-center">
          <input
            type="text"
            placeholder="Çalışan ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-4 py-2 rounded-lg text-sm flex-1"
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
            className="text-xs px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition whitespace-nowrap"
          >
            Temizle
          </button>

          <div className="ml-auto text-xs text-gray-500 flex items-center gap-4 whitespace-nowrap">
            <span>
              Bekleyen: {leaves.filter((l) => l.status === "beklemede").length}
            </span>
            <span>Toplam: {filteredLeaves.length}</span>
          </div>
        </div>

        <div className="bg-white border rounded-xl shadow-sm overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Ad Soyad</th>
                <th className="p-3 text-center">Tür</th>
                <th className="p-3 text-center">Tarih</th>
                <th className="p-3 text-center">Durum</th>
                <th className="p-3 text-center">Aksiyon</th>
              </tr>
            </thead>

            <tbody>
              {filteredLeaves.map((l) => (
                <tr key={l.id} className="border-t hover:bg-gray-50 transition">
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

                            try {
                              await approveLeave(l.id, user.uid);

                              setLeaves((prev) =>
                                prev.map((x) =>
                                  x.id === l.id
                                    ? { ...x, status: "onaylandı" }
                                    : x,
                                ),
                              );

                              showToast({
                                type: "success",
                                title: "Onaylandı",
                                message: "İzin talebi onaylandı.",
                              });
                            } catch (err) {
                              console.error(err);
                              showToast({
                                type: "error",
                                title: "Hata",
                                message: "Onaylama sırasında hata oluştu.",
                              });
                            }
                          }}
                          className="text-green-600 hover:underline"
                        >
                          Onayla
                        </button>

                        <button
                          onClick={async () => {
                            if (!user) return;

                            const reason = prompt("Red sebebi?");
                            if (!reason) return;

                            try {
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

                              showToast({
                                type: "success",
                                title: "Reddedildi",
                                message: "İzin talebi reddedildi.",
                              });
                            } catch (err) {
                              console.error(err);
                              showToast({
                                type: "error",
                                title: "Hata",
                                message: "Reddetme sırasında hata oluştu.",
                              });
                            }
                          }}
                          className="text-red-600 hover:underline"
                        >
                          Reddet
                        </button>
                      </>
                    )}

                    {(l.status === "beklemede" ||
                      l.status === "reddedildi") && (
                      <button
                        onClick={async () => {
                          if (!confirm("Bu izin silinsin mi?")) return;

                          try {
                            await deleteLeave(l.id);

                            setLeaves((prev) =>
                              prev.filter((x) => x.id !== l.id),
                            );

                            showToast({
                              type: "success",
                              title: "Silindi",
                              message: "İzin talebi silindi.",
                            });
                          } catch (err) {
                            console.error(err);
                            showToast({
                              type: "error",
                              title: "Hata",
                              message: "Silme sırasında hata oluştu.",
                            });
                          }
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

          {filteredLeaves.length === 0 && (
            <div className="p-6 text-sm text-gray-500 text-center">
              Filtreye uygun izin bulunamadı
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
