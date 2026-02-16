"use client";

import { useEffect, useMemo, useState } from "react";
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
import { TDocumentDefinitions } from "pdfmake/interfaces";

const DAYS: { key: DayKey; label: string }[] = [
  { key: "mon", label: "Pzt" },
  { key: "tue", label: "Sal" },
  { key: "wed", label: "Çar" },
  { key: "thu", label: "Per" },
  { key: "fri", label: "Cum" },
  { key: "sat", label: "Cts" },
  { key: "sun", label: "Paz" },
];

function calcHours(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return eh + em / 60 - (sh + sm / 60);
}

export default function ShiftsPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [modal, setModal] = useState<{
    userId: string;
    date: Date;
    shift?: Shift;
  } | null>(null);

  const [weekStart, setWeekStart] = useState<Date>(() => getWeekRange().monday);

  const weekRange = useMemo(() => getWeekRange(weekStart), [weekStart]);

  type VfsType = Record<string, string>;

  function extractVfs(module: unknown): VfsType {
    if (typeof module === "object" && module !== null && "default" in module) {
      const def = (module as { default: unknown }).default;

      if (typeof def === "object" && def !== null && "pdfMake" in def) {
        const pdfMakeObj = (def as { pdfMake: unknown }).pdfMake;

        if (
          typeof pdfMakeObj === "object" &&
          pdfMakeObj !== null &&
          "vfs" in pdfMakeObj
        ) {
          return (pdfMakeObj as { vfs: VfsType }).vfs;
        }
      }

      if (typeof def === "object" && def !== null) {
        return def as VfsType;
      }
    }

    throw new Error("VFS yapısı çözümlenemedi");
  }

  const loadPdfMake = async () => {
    const pdfMakeModule = await import("pdfmake/build/pdfmake");
    const pdfFontsModule = await import("pdfmake/build/vfs_fonts");

    const pdfMakeInstance = pdfMakeModule.default;

    const vfs = extractVfs(pdfFontsModule);

    pdfMakeInstance.vfs = vfs;

    return pdfMakeInstance;
  };

  const load = async (): Promise<void> => {
    setLoading(true);

    const [u, s] = await Promise.all([
      listUsers(),
      listShiftsByDateRange(weekRange.monday, weekRange.sunday),
    ]);

    setUsers(u);
    setShifts(s);
    setLoading(false);
  };

  useEffect(() => {
    let active = true;

    const fetchData = async (): Promise<void> => {
      const [u, s] = await Promise.all([
        listUsers(),
        listShiftsByDateRange(weekRange.monday, weekRange.sunday),
      ]);

      if (!active) return;

      setUsers(u);
      setShifts(s);
      setLoading(false);
    };

    fetchData();

    return () => {
      active = false;
    };
  }, [weekRange.monday, weekRange.sunday]);

  const handleExportPdf = async (): Promise<void> => {
    const pdfMakeInstance = await loadPdfMake();

    const body: (string | number)[][] = [];

    body.push(["#", "Ad Soyad", ...DAYS.map((d) => d.label), "Toplam (saat)"]);

    users.forEach((u, index) => {
      let total = 0;
      const row: (string | number)[] = [];

      row.push(index + 1);
      row.push(u.name);

      DAYS.forEach((d) => {
        const shift = shifts.find(
          (s) => s.userId === u.id && getDayKey(s.date) === d.key,
        );

        if (shift) {
          total += calcHours(shift.startTime, shift.endTime);
          row.push(`${shift.startTime} - ${shift.endTime}`);
        } else {
          row.push("-");
        }
      });

      row.push(total.toFixed(1));
      body.push(row);
    });

    const docDefinition: TDocumentDefinitions = {
      pageOrientation: "landscape",
      pageSize: "A4",
      content: [
        {
          table: {
            headerRows: 1,
            body,
          },
        },
      ],
    };

    pdfMakeInstance
      .createPdf(docDefinition)
      .download(`mesaitak-haftalik-${formatDate(weekRange.monday)}.pdf`);
  };

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
        <table className="min-w-full text-sm text-center border-collapse">
          <thead className="bg-gray-100 text-gray-700">
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
                <tr key={u.id} className="border-t hover:bg-blue-50 transition">
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
                        className={`p-3 cursor-pointer transition
                          ${
                            shift
                              ? "bg-green-50 hover:bg-green-100 text-green-800 font-medium"
                              : "bg-gray-50 hover:bg-gray-100 text-gray-400"
                          }
                        `}
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
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-dashed border-gray-300 text-gray-400">
                            +
                          </span>
                        )}
                      </td>
                    );
                  })}

                  <td className="p-3 font-bold text-indigo-700 bg-indigo-50">
                    {total.toFixed(1)} sa
                  </td>
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

      <button
        onClick={handleExportPdf}
        className="bg-indigo-600 text-white px-4 py-2 rounded"
      >
        PDF İndir
      </button>
    </div>
  );
}
