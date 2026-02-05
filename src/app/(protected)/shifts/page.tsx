"use client";

import { useEffect, useState } from "react";
import { listUsers, AppUser } from "@/lib/db/users";
import {
  listShiftsByDateRange,
  createShift,
  updateShift,
  Shift,
} from "@/lib/db/shifts";
import { getWeekRange, getDayKey, DayKey } from "@/lib/utils/week";
import { getDateForDayKey } from "@/lib/utils/week";
import ShiftModal from "./ShiftModal";

const DAYS: { key: DayKey; label: string }[] = [
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
  const [modal, setModal] = useState<{
    userId: string;
    date: Date;
    shift?: Shift;
  } | null>(null);

  const { monday, sunday } = getWeekRange();

  const load = async () => {
    setLoading(true);
    const [u, s] = await Promise.all([
      listUsers(),
      listShiftsByDateRange(monday, sunday),
    ]);
    setUsers(u);
    setShifts(s);
    setLoading(false);
  };

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);

      const { monday, sunday } = getWeekRange();

      const [u, s] = await Promise.all([
        listUsers(),
        listShiftsByDateRange(monday, sunday),
      ]);

      if (!mounted) return;

      setUsers(u);
      setShifts(s);
      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
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

                    if (shift) {
                      total += calcHours(shift.startTime, shift.endTime);
                    }

                    return (
                      <td
                        key={d.key}
                        className="p-3 cursor-pointer hover:bg-gray-100"
                        onClick={() =>
                          setModal({
                            userId: u.id,
                            date:
                              shift?.date ?? getDateForDayKey(monday, d.key),
                            shift,
                          })
                        }
                      >
                        {shift ? (
                          <>
                            {shift.startTime} – {shift.endTime}
                          </>
                        ) : (
                          <span className="text-gray-400">+</span>
                        )}
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

      {modal && (
        <ShiftModal
          open
          initial={
            modal.shift
              ? {
                  startTime: modal.shift.startTime,
                  endTime: modal.shift.endTime,
                }
              : undefined
          }
          onClose={() => setModal(null)}
          onSave={async (start, end) => {
            if (modal.shift) {
              await updateShift(modal.shift.id, {
                startTime: start,
                endTime: end,
              });
            } else {
              await createShift({
                userId: modal.userId,
                date: modal.date,
                startTime: start,
                endTime: end,
              });
            }

            await load();
          }}
        />
      )}
    </div>
  );
}
