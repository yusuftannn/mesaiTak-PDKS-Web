"use client";

import { useEffect, useMemo, useState } from "react";
import {
  listAttendanceByDate,
  AttendanceWithLocation,
} from "@/lib/db/attendance";
import { listUsers } from "@/lib/db/users";
import { useAuthStore } from "@/lib/auth/auth.store";

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

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [data, setData] = useState<AttendanceWithLocation[]>([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("checkIn");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  useEffect(() => {
    async function load() {
      setLoading(true);

      const attendance = await listAttendanceByDate(date);
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
    <div className="p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Liste Görünümü</h1>
          <div className="text-sm text-gray-500 mt-1">
            {summary.total} kayıt • Giriş: {summary.hasIn} • Çıkış:{" "}
            {summary.hasOut} • Konum: {summary.withAnyLoc}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border rounded-lg px-3 py-2"
          />

          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ara..."
            className="border rounded-lg px-3 py-2 w-full sm:w-64"
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="all">Tüm Durumlar</option>
            {availableStatuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="checkIn">Sırala: Giriş</option>
            <option value="checkOut">Sırala: Çıkış</option>
            <option value="name">Sırala: İsim</option>
            <option value="status">Sırala: Durum</option>
          </select>

          <button
            onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
            className="border rounded-lg px-3 py-2 hover:bg-gray-50"
            title="Sıralama yönü"
          >
            {sortDir === "asc" ? "↑ Artan" : "↓ Azalan"}
          </button>
        </div>
      </div>

      {loading ? (
        <div>Yükleniyor...</div>
      ) : filtered.length === 0 ? (
        <div className="border rounded-2xl p-6 text-gray-600">
          Kayıt bulunamadı.
        </div>
      ) : (
        <>
          <div className="hidden lg:block border rounded-2xl overflow-hidden">
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
                {filtered.map((x, index) => {
                  const hasLoc = !!x.checkInLocation || !!x.checkOutLocation;

                  return (
                    <tr
                      key={x.id}
                      className="border-t hover:bg-gray-50 transition"
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
                        🟢 {formatTime(x.checkInAt)}
                      </td>

                      <td className="p-3" title={formatDateTime(x.checkOutAt)}>
                        🔴 {formatTime(x.checkOutAt)}
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
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
