"use client";

import { useEffect, useState } from "react";
import { listUsers, AppUser } from "@/lib/db/users";
import { listShiftsByDateRange, Shift } from "@/lib/db/shifts";
import { getWeekRange, getDayKey } from "@/lib/utils/week";

const DAYS = [
  { key: "mon", label: "Pzt" },
  { key: "tue", label: "Sal" },
  { key: "wed", label: "Çar" },
  { key: "thu", label: "Per" },
  { key: "fri", label: "Cum" },
  { key: "sat", label: "Cts" },
  { key: "sun", label: "Paz" },
];

function calcHours(start: string, end: string) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return eh + em / 60 - (sh + sm / 60);
}

export default function ShiftsPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);

      const { monday, sunday } = getWeekRange();

      const [u, s] = await Promise.all([
        listUsers(),
        listShiftsByDateRange(monday, sunday),
      ]);

      setUsers(u);
      setShifts(s);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <div className="p-6">Yükleniyor…</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-lg font-semibold">Haftalık Vardiya Planı</h2>

      <div className="overflow-auto border rounded-xl">
        <table className="min-w-full text-sm text-center">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3 text-left">Ad Soyad</th>
              {DAYS.map((d) => (
                <th key={d.key} className="p-3">
                  {d.label}
                </th>
              ))}
              <th className="p-3">Toplam</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u, index) => {
              let total = 0;

              return (
                <tr key={u.id} className="border-t">
                  <td className="p-3">{index + 1}</td>

                  <td className="p-3 text-left font-medium">{u.name}</td>

                  {DAYS.map((d) => {
                    const shift = shifts.find(
                      (s) => s.userId === u.id && getDayKey(s.date) === d.key,
                    );

                    if (!shift) {
                      return (
                        <td key={d.key} className="p-3 text-gray-400">
                          —
                        </td>
                      );
                    }

                    const hours = calcHours(shift.startTime, shift.endTime);
                    total += hours;

                    return (
                      <td key={d.key} className="p-3">
                        {shift.startTime} – {shift.endTime}
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
