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
    <div className="p-6 space-y-6">
      <h2 className="text-lg font-semibold">
        {date.toLocaleString("tr-TR", {
          month: "long",
          year: "numeric",
        })}{" "}
        - Toplam Çalışma Süreleri
      </h2>

      <div className="flex items-center gap-4">
        <button
          onClick={() =>
            setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1))
          }
          className="px-3 py-1 border rounded hover:bg-gray-100"
        >
          ← Önceki
        </button>

        <button
          onClick={() =>
            setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1))
          }
          className="px-3 py-1 border rounded hover:bg-gray-100"
        >
          Sonraki →
        </button>
      </div>

      <div className="overflow-auto border rounded-xl">
        <table className="min-w-full text-sm text-center">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3">Sicil No</th>
              <th className="p-3 text-left">Ad Soyad</th>
              {Array.from({ length: days }).map((_, i) => (
                <th key={i} className="p-3">
                  {i + 1}
                </th>
              ))}
              <th className="p-3">Toplam Saat</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u, index) => {
              let total = 0;

              return (
                <tr key={u.id} className="border-t">
                  <td className="p-3">{String(index + 1).padStart(6, "0")}</td>
                  <td className="p-3 text-left font-medium">{u.name}</td>

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
                        <td key={dayIndex} className="bg-orange-400 text-white">
                          İzin
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
                        <td key={dayIndex} className="bg-green-500 text-white">
                          {hours.toFixed(1)}
                        </td>
                      );
                    }

                    return (
                      <td key={dayIndex} className="bg-gray-100">
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
  );
}
