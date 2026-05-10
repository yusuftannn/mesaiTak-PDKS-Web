"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, LogOut } from "lucide-react";
import { listAttendanceByDate } from "@/features/attendance/attendance.service";
import { AttendanceWithLocation } from "@/features/attendance/attendance.types";
import { listUsers } from "@/features/users/users.service";
import { useAuthStore } from "@/features/auth/auth.store";
import dayjs from "dayjs";

type SortKey = "name" | "checkIn" | "checkOut" | "status";
type SortDir = "asc" | "desc";

function safeTime(d?: Date | null) {
  return d ? d.getTime() : null;
}

function formatTime(d?: Date | null) {
  return d
    ? d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
    : "-";
}

function formatDateTime(d?: Date | null) {
  return d ? d.toLocaleString("tr-TR") : "-";
}

function getStatusBadge(status?: string) {
  const s = (status ?? "").toLowerCase();

  switch (s) {
    case "çalışıyor":
      return "bg-blue-100 text-blue-700 border-blue-200";

    case "mola":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";

    case "tamamlandı":
      return "bg-green-100 text-green-700 border-green-200";

    case "boşta":
      return "bg-gray-100 text-gray-700 border-gray-200";

    default:
      return "bg-gray-50 text-gray-600 border-gray-200";
  }
}

export default function LocationsListPage() {
  const { user } = useAuthStore();

  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [data, setData] = useState<AttendanceWithLocation[]>([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("checkIn");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  useEffect(() => {
    async function load() {
      setLoading(true);

      const start = new Date(date);
      const end = new Date(date);

      const attendance = await listAttendanceByDate(start, end);
      const users = await listUsers();

      const merged: AttendanceWithLocation[] = attendance.map((a) => {
        const u = users.find((x) => x.uid === a.uid);

        return {
          ...a,
          userName: u?.name ?? a.uid,
        };
      });

      setData(merged);
      setLoading(false);
    }

    load();
  }, [date]);

  const availableStatuses = useMemo(() => {
    const set = new Set<string>();
    data.forEach((x) => {
      if (x.status) set.add(String(x.status));
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "tr"));
  }, [data]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    return data
      .filter((x) => {
        const matchQ =
          !query ||
          (x.userName ?? "").toLowerCase().includes(query) ||
          String(x.uid ?? "")
            .toLowerCase()
            .includes(query);

        const matchStatus =
          status === "all" ? true : String(x.status) === status;

        return matchQ && matchStatus;
      })
      .sort((a, b) => {
        const dir = sortDir === "asc" ? 1 : -1;

        if (sortKey === "name") {
          return dir * (a.userName ?? "").localeCompare(b.userName ?? "", "tr");
        }

        if (sortKey === "status") {
          return (
            dir *
            String(a.status ?? "").localeCompare(String(b.status ?? ""), "tr")
          );
        }

        if (sortKey === "checkIn") {
          const at = safeTime(a.checkInAt);
          const bt = safeTime(b.checkInAt);
          if (at === null && bt === null) return 0;
          if (at === null) return 1;
          if (bt === null) return -1;
          return dir * (at - bt);
        }

        const at = safeTime(a.checkOutAt);
        const bt = safeTime(b.checkOutAt);
        if (at === null && bt === null) return 0;
        if (at === null) return 1;
        if (bt === null) return -1;
        return dir * (at - bt);
      });
  }, [data, q, status, sortKey, sortDir]);

  const summary = useMemo(() => {
    const total = filtered.length;
    const hasIn = filtered.filter((x) => !!x.checkInAt).length;
    const hasOut = filtered.filter((x) => !!x.checkOutAt).length;
    const withAnyLoc = filtered.filter(
      (x) => !!x.checkInLocation || !!x.checkOutLocation,
    ).length;

    return { total, hasIn, hasOut, withAnyLoc };
  }, [filtered]);

  if (!user) return null;

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col gap-5 mb-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Liste Görünümü
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Personellerin günlük giriş, çıkış ve konum kayıtlarını liste
              halinde görüntüleyin.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-500">
            <span className="bg-gray-100 rounded-full px-3 py-1">
              Toplam: {summary.total}
            </span>

            <span className="bg-green-100 text-green-700 rounded-full px-3 py-1">
              Giriş: {summary.hasIn}
            </span>

            <span className="bg-red-100 text-red-700 rounded-full px-3 py-1">
              Çıkış: {summary.hasOut}
            </span>

            <span className="bg-blue-100 text-blue-700 rounded-full px-3 py-1">
              Konum: {summary.withAnyLoc}
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
            {/* Date */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500">Tarih</label>

              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-11 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-black/5"
              />
            </div>

            {/* Search */}
            <div className="flex flex-col gap-1 sm:col-span-2 xl:col-span-1">
              <label className="text-xs font-medium text-gray-500">Arama</label>

              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="İsim veya UID ara..."
                className="h-11 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-black/5"
              />
            </div>

            {/* Status */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500">Durum</label>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-11 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-black/5"
              >
                <option value="all">Tüm Durumlar</option>

                {availableStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500">
                Sıralama
              </label>

              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className="h-11 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-black/5"
              >
                <option value="checkIn">Giriş Saati</option>
                <option value="checkOut">Çıkış Saati</option>
                <option value="name">İsim</option>
                <option value="status">Durum</option>
              </select>
            </div>

            {/* Sort Direction */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500">Yön</label>

              <button
                onClick={() =>
                  setSortDir((d) => (d === "asc" ? "desc" : "asc"))
                }
                className="h-11 rounded-xl border border-gray-200 px-4 text-sm font-medium hover:bg-gray-50 transition"
              >
                {sortDir === "asc" ? "↑ Artan" : "↓ Azalan"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div>Yükleniyor...</div>
      ) : (
        <>
          <div className="hidden lg:block rounded-2xl overflow-hidden border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left">
                  <th className="p-3 w-12">#</th>
                  <th className="p-3">İsim Soyisim</th>
                  <th className="p-3">Konum</th>
                  <th className="p-3">Giriş</th>
                  <th className="p-3">Çıkış</th>
                  <th className="p-3">Durum</th>
                </tr>
              </thead>

              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-10 text-center text-gray-500 bg-white"
                    >
                      Kayıt bulunamadı
                    </td>
                  </tr>
                ) : (
                  filtered.map((x, index) => {
                    const hasLoc = !!x.checkInLocation || !!x.checkOutLocation;

                    return (
                      <tr
                        key={x.id}
                        className="border-t border-gray-100 hover:bg-gray-50 transition"
                      >
                        <td className="p-3">{index + 1}</td>

                        <td className="p-3">
                          <div className="font-medium">{x.userName}</div>
                        </td>

                        <td className="p-3">
                          {hasLoc ? (
                            <span className="text-green-700 font-medium">
                              Var
                            </span>
                          ) : (
                            <span className="text-gray-500">Yok</span>
                          )}
                        </td>

                        <td className="p-3" title={formatDateTime(x.checkInAt)}>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />

                            <span>{formatTime(x.checkInAt)}</span>
                          </div>
                        </td>

                        <td
                          className="p-3"
                          title={formatDateTime(x.checkOutAt)}
                        >
                          <div className="flex items-center gap-2">
                            <LogOut className="w-4 h-4 text-red-500" />

                            <span>{formatTime(x.checkOutAt)}</span>
                          </div>
                        </td>

                        <td className="p-3">
                          <span
                            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${getStatusBadge(
                              x.status,
                            )}`}
                          >
                            {x.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="grid gap-3 lg:hidden">
            {filtered.length === 0 ? (
              <div className="border border-gray-200 rounded-2xl p-6 text-center text-sm text-gray-500 bg-white">
                Kayıt bulunamadı
              </div>
            ) : (
              filtered.map((x) => {
                const hasLoc = !!x.checkInLocation || !!x.checkOutLocation;

                return (
                  <div
                    key={x.id}
                    className="border border-gray-200 rounded-2xl p-4 bg-white shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-sm">
                          {x.userName}
                        </div>

                        <div className="text-xs text-gray-500 mt-1">
                          UID: {x.uid}
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${getStatusBadge(
                          x.status,
                        )}`}
                      >
                        {x.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                      <div>
                        <div className="text-gray-500 text-xs mb-1">Giriş</div>

                        <div className="font-medium">
                          {formatTime(x.checkInAt)}
                        </div>
                      </div>

                      <div>
                        <div className="text-gray-500 text-xs mb-1">Çıkış</div>

                        <div className="font-medium">
                          {formatTime(x.checkOutAt)}
                        </div>
                      </div>

                      <div className="col-span-2">
                        <div className="text-gray-500 text-xs mb-1">Konum</div>

                        <div
                          className={
                            hasLoc
                              ? "text-green-700 font-medium"
                              : "text-gray-500"
                          }
                        >
                          {hasLoc ? "Konum kaydı mevcut" : "Konum kaydı yok"}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
