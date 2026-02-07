"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { listUsers, AppUser } from "@/lib/db/users";
import {
  listShiftsByDateRange,
  createShift,
  updateShift,
  removeShift,
  copyWeekShifts,
  copyWeekShiftsOverwrite,
  clearWeekShifts,
  Shift,
} from "@/lib/db/shifts";
import {
  getWeekRange,
  getDayKey,
  DayKey,
  addWeeks,
  formatDate,
  getDateForDayKey,
} from "@/lib/utils/week";
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

  const [weekStart, setWeekStart] = useState<Date>(() => getWeekRange().monday);

  const weekRange = useMemo(() => getWeekRange(weekStart), [weekStart]);

  const load = useCallback(async () => {
    setLoading(true);

    const [u, s] = await Promise.all([
      listUsers(),
      listShiftsByDateRange(weekRange.monday, weekRange.sunday),
    ]);

    setUsers(u);
    setShifts(s);
    setLoading(false);
  }, [weekRange.monday, weekRange.sunday]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!mounted) return;
      await load();
    })();

    return () => {
      mounted = false;
    };
  }, [load]);

  if (loading) {
    return <div className="p-6">Yükleniyor…</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-lg font-semibold">Haftalık Vardiya Planı</h2>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setWeekStart((d) => addWeeks(d, -1))}
            className="px-3 py-1 border rounded cursor-pointer hover:bg-gray-100"
          >
            ← Önceki
          </button>

          <div className="font-medium">
            {formatDate(weekRange.monday)} – {formatDate(weekRange.sunday)}
          </div>

          <button
            onClick={() => setWeekStart((d) => addWeeks(d, 1))}
            className="px-3 py-1 border rounded cursor-pointer hover:bg-gray-100"
          >
            Sonraki →
          </button>
        </div>

        <div className="flex gap-2">
          <div className="flex gap-2 flex-wrap"></div>
          <button
            onClick={async () => {
              if (
                !confirm(
                  "Bu haftadaki vardiyalar bir sonraki haftaya kopyalansın mı?",
                )
              )
                return;

              await copyWeekShifts(weekRange.monday);
              setWeekStart((d) => addWeeks(d, 1));
            }}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Kopyala
          </button>

          <button
            onClick={async () => {
              if (
                !confirm(
                  "Hedef haftadaki TÜM vardiyalar silinip, bu haftaki vardiyalar yazılacak. Emin misiniz?",
                )
              )
                return;

              await copyWeekShiftsOverwrite(weekRange.monday);
              setWeekStart((d) => addWeeks(d, 1));
            }}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Üzerine yazarak kopyala
          </button>

          <button
            onClick={async () => {
              if (
                !confirm("Bu haftadaki tüm vardiyalar silinecek. Emin misiniz?")
              )
                return;

              await clearWeekShifts(weekRange.monday);
              await load();
            }}
            className="bg-red-700 text-white px-4 py-2 rounded"
          >
            Bu haftayı tamamen temizle
          </button>
        </div>
      </div>

      <div className="overflow-auto border rounded-xl">
        <table className="min-w-full text-sm text-center">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3 text-left">Ad Soyad</th>

              {DAYS.map((d) => {
                const date = getDateForDayKey(weekRange.monday, d.key);

                return (
                  <th key={d.key} className="p-3">
                    <div className="flex flex-col items-center leading-tight">
                      <span>{d.label}</span>
                      <span className="text-xs text-gray-500">
                        {formatDate(date)}
                      </span>
                    </div>
                  </th>
                );
              })}

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
                              shift?.date ??
                              getDateForDayKey(weekRange.monday, d.key),
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
                  type: modal.shift.type,
                }
              : undefined
          }
          onClose={() => setModal(null)}
          onSave={async (start, end, type) => {
            if (modal.shift) {
              await updateShift(modal.shift.id, {
                startTime: start,
                endTime: end,
                type,
              });
            } else {
              await createShift({
                userId: modal.userId,
                date: modal.date,
                startTime: start,
                endTime: end,
                type,
              });
            }

            await load();
          }}
          onDelete={
            modal.shift
              ? async () => {
                  await removeShift(modal.shift!.id);
                  await load();
                }
              : undefined
          }
        />
      )}
    </div>
  );
}
