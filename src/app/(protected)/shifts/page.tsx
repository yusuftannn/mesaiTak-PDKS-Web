"use client";

import { useEffect, useMemo, useState } from "react";
import { listUsers } from "@/features/users/users.service";
import { AppUser } from "@/features/users/users.types";
import Button from "@/components/ui/Button";
import {
  listShiftsByDateRange,
  createShift,
  updateShift,
  removeShift,
  copyWeekShifts,
  copyWeekShiftsOverwrite,
  clearWeekShifts,
} from "@/features/shifts/shifts.service";
import { Shift } from "@/features/shifts/shifts.types";
import {
  getWeekRange,
  getDayKey,
  DayKey,
  addWeeks,
  formatDate,
  getDateForDayKey,
} from "@/lib/utils/week";
import { loadPdfMake } from "@/lib/utils/exportPdf";
import ShiftModal from "./ShiftModal";
import { TDocumentDefinitions } from "pdfmake/interfaces";
import { FileDown, ChevronLeft, ChevronRight } from "lucide-react";

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

  const handleExportExcel = async (): Promise<void> => {
    const ExcelJS = (await import("exceljs")).default;

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Vardiya Planı");

    const header = [
      "#",
      "Ad Soyad",
      ...DAYS.map((d) => d.label),
      "Toplam (saat)",
    ];

    sheet.addRow(header);

    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFEFEFEF" },
      };
      cell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };
    });

    users.forEach((u, index) => {
      let total = 0;

      const rowData: (string | number)[] = [];
      rowData.push(index + 1);
      rowData.push(u.name);

      DAYS.forEach((d) => {
        const shift = shifts.find(
          (s) => s.userId === u.id && getDayKey(s.date) === d.key,
        );

        if (shift) {
          const hours = calcHours(shift.startTime, shift.endTime);
          total += hours;
          rowData.push(`${shift.startTime} - ${shift.endTime}`);
        } else {
          rowData.push("-");
        }
      });

      rowData.push(Number(total.toFixed(1)));

      const row = sheet.addRow(rowData);

      row.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        };

        if (colNumber === header.length) {
          cell.font = { bold: true };
        }

        cell.alignment = { vertical: "middle", horizontal: "center" };
      });
    });

    sheet.columns = [
      { width: 5 },
      { width: 22 },
      ...DAYS.map(() => ({ width: 16 })),
      { width: 15 },
    ];

    sheet.views = [{ state: "frozen", ySplit: 1 }];

    const buffer = await workbook.xlsx.writeBuffer();

    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mesaitak-haftalik-${formatDate(weekRange.monday)}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="p-6">Yükleniyor…</div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h2 className="text-lg font-semibold">Haftalık Vardiya Planı</h2>      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center justify-between md:justify-start gap-2 md:gap-4">
          <Button
            variant="secondary"
            size="sm"
            icon={<ChevronLeft size={16} />}
            onClick={() => setWeekStart((d) => addWeeks(d, -1))}
          />

          <div className="font-medium text-sm md:text-base text-center md:text-left">
            {formatDate(weekRange.monday)} – {formatDate(weekRange.sunday)}
          </div>

          <Button
            variant="secondary"
            size="sm"
            icon={<ChevronRight size={16} />}
            onClick={() => setWeekStart((d) => addWeeks(d, 1))}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <Button
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
          >
            Kopyala
          </Button>

          <Button
            variant="danger"
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
          >
            Üzerine yaz
          </Button>

          <Button
            variant="danger"
            onClick={async () => {
              if (
                !confirm("Bu haftadaki tüm vardiyalar silinecek. Emin misiniz?")
              )
                return;

              await clearWeekShifts(weekRange.monday);
              await load();
            }}
          >
            Temizle
          </Button>
        </div>
      </div>
  
      <div className="hidden md:block">
        <div className="w-full overflow-x-auto rounded-xl border">
          <table className="min-w-225 w-full text-sm text-center border-collapse">
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
                  <tr
                    key={u.id}
                    className="hover:bg-blue-50 transition bg-white"
                  >
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
                      }`}
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
      </div>
      <div className="md:hidden space-y-4">
        {users.map((u) => {
          let total = 0;

          return (
            <div key={u.id} className="p-4 bg-white rounded-xl shadow">
              <div className="font-semibold text-lg mb-2">{u.name}</div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                {DAYS.map((d) => {
                  const shift = shifts.find(
                    (s) => s.userId === u.id && getDayKey(s.date) === d.key,
                  );

                  if (shift) {
                    total += calcHours(shift.startTime, shift.endTime);
                  }

                  return (
                    <div
                      key={d.key}
                      className={`p-2 rounded-lg text-center cursor-pointer
                  ${
                    shift
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-400"
                  }`}
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
                      <div className="text-xs">{d.label}</div>
                      <div className="font-medium">
                        {shift ? `${shift.startTime} - ${shift.endTime}` : "+"}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 text-right font-bold text-indigo-600">
                {total.toFixed(1)} saat
              </div>
            </div>
          );
        })}
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
                companyId: "",
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
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          variant="success"
          icon={<FileDown size={16} />}
          onClick={handleExportPdf}
        >
          PDF
        </Button>

        <Button
          variant="primary"
          icon={<FileDown size={16} />}
          onClick={handleExportExcel}
        >
          Excel
        </Button>
      </div>
    </div>
  );
}
