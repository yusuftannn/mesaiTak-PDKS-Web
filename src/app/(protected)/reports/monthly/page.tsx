"use client";

import { useEffect, useState, useCallback } from "react";
import { listUsers, AppUser } from "@/lib/db/users";
import { getMonthlyReport } from "@/lib/db/reports";
import {
  AttendanceDoc,
  LeaveDoc,
} from "../../../../lib/db/constants/reportTypes";

function getDaysInMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function startOfMonth(date: Date) {
  const d = new Date(date.getFullYear(), date.getMonth(), 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfMonth(date: Date) {
  const d = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  d.setHours(23, 59, 59, 999);
  return d;
}

function calcHours(start?: Date, end?: Date) {
  if (!start || !end) return 0;
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
}

export default function MonthlyReportPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [users, setUsers] = useState<AppUser[]>([]);
  const [attendance, setAttendance] = useState<AttendanceDoc[]>([]);
  const [leaves, setLeaves] = useState<LeaveDoc[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (baseDate: Date) => {
    setLoading(true);

    const start = startOfMonth(baseDate);
    const end = endOfMonth(baseDate);

    const [u, report] = await Promise.all([
      listUsers(),
      getMonthlyReport(start, end),
    ]);

    setUsers(u);
    setAttendance(report.attendance);
    setLeaves(report.leaves);
    setLoading(false);
  }, []);

  useEffect(() => {
    const run = async () => {
      await load(date);
    };
    run();
  }, [date, load]);

  if (loading) {
    return <div className="p-6">Yükleniyor…</div>;
  }

  const days = getDaysInMonth(date);

  return (
    <div className="p-6">
      <div className="mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {date.toLocaleString("tr-TR", {
              month: "long",
              year: "numeric",
            })}{" "}
            Aylık Rapor
          </h2>

          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1))
              }
              className="px-4 py-2 border rounded-lg hover:bg-gray-100 text-sm"
            >
              ← Önceki
            </button>

            <button
              onClick={() =>
                setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1))
              }
              className="px-4 py-2 border rounded-lg hover:bg-gray-100 text-sm"
            >
              Sonraki →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border rounded-xl p-4 shadow-sm">
            <div className="text-xs text-gray-500">Toplam Çalışan</div>
            <div className="text-xl font-semibold">{users.length}</div>
          </div>

          <div className="bg-white border rounded-xl p-4 shadow-sm">
            <div className="text-xs text-gray-500">Toplam Çalışma Saati</div>
            <div className="text-xl font-semibold">
              {attendance
                .reduce((sum, a) => {
                  if (!a.checkInAt || !a.checkOutAt) return sum;
                  return (
                    sum + calcHours(a.checkInAt.toDate(), a.checkOutAt.toDate())
                  );
                }, 0)
                .toFixed(1)}{" "}
              sa
            </div>
          </div>

          <div className="bg-white border rounded-xl p-4 shadow-sm">
            <div className="text-xs text-gray-500">Onaylı İzin Günü</div>
            <div className="text-xl font-semibold">
              {leaves.filter((l) => l.status === "onaylandı").length}
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-xl shadow-sm overflow-auto">
          <table className="min-w-full text-xs text-center">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">Ad Soyad</th>
                {Array.from({ length: days }).map((_, i) => (
                  <th key={i} className="p-2">
                    {i + 1}
                  </th>
                ))}
                <th className="p-3 font-semibold">Toplam</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u, index) => {
                let total = 0;

                return (
                  <tr
                    key={u.id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="p-3 text-left">
                      {String(index + 1).padStart(4, "0")}
                    </td>

                    <td className="p-3 text-left font-medium whitespace-nowrap">
                      {u.name}
                    </td>

                    {Array.from({ length: days }).map((_, dayIndex) => {
                      const currentDate = new Date(
                        date.getFullYear(),
                        date.getMonth(),
                        dayIndex + 1,
                      );

                      const att = attendance.find((a) => {
                        const d = a.date.toDate();
                        return (
                          a.uid === u.id &&
                          d.getDate() === currentDate.getDate() &&
                          d.getMonth() === currentDate.getMonth()
                        );
                      });

                      const leave = leaves.find((l) => {
                        const start = l.startDate.toDate();
                        const end = l.endDate.toDate();
                        return (
                          l.userId === u.id &&
                          currentDate >= start &&
                          currentDate <= end &&
                          l.status === "onaylandı"
                        );
                      });

                      if (leave) {
                        return (
                          <td
                            key={dayIndex}
                            className="bg-orange-400 text-white text-[10px]"
                          >
                            İ
                          </td>
                        );
                      }

                      if (att?.checkInAt && att?.checkOutAt) {
                        const hours = calcHours(
                          att.checkInAt.toDate(),
                          att.checkOutAt.toDate(),
                        );
                        total += hours;

                        return (
                          <td
                            key={dayIndex}
                            className="bg-green-500 text-white text-[10px]"
                          >
                            {hours.toFixed(1)}
                          </td>
                        );
                      }

                      return (
                        <td key={dayIndex} className="bg-gray-100 text-[10px]">
                          —
                        </td>
                      );
                    })}

                    <td className="p-3 font-semibold">{total.toFixed(1)} sa</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
