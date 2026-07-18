"use client";

import { useEffect, useState } from "react";
import LegendTable from "./LegendTable";
import { buildMonthlyPuantaj } from "@/features/puantaj/puantaj";
import { minutesToTime } from "@/lib/utils/time";
import { loadPdfMake } from "@/lib/utils/exportPdf";
import Button from "@/components/ui/Button";
import { ChevronLeft, ChevronRight, FileDown } from "lucide-react";

type PuantajReport = {
  expectedWorkMinutes: number;
  expectedNormalMinutes: number;

  totalWorkMinutes: number;
  normalMinutes: number;
  overtimeMinutes: number;
  missingMinutes: number;

  expectedWorkDays: number;
  workedDays: number;
  absentDays: number;
  weekendDays: number;
  holidayDays: number;

  annualLeaveDays: number;
  otherLeaveDays: number;
  unpaidLeaveDays: number;
  reportDays: number;
};

type Row = {
  sicilNo: string;
  name: string;
  report: PuantajReport;
};

const exportColumns = [
  "Sicil No",
  "Ad Soyad",
  "Beklenen Sure TC",
  "Beklenen Sure NM",
  "Hesaplanan Sure TC",
  "Hesaplanan Sure NM",
  "FM",
  "FM (RT)",
  "EM",
  "DZ",
  "HT",
  "RT",
  "YI",
  "MZ",
  "R",
  "Beklenen Gun CG",
  "Beklenen Gun TC",
  "Hesaplanan Gun NM",
  "Hesaplanan Gun TC",
  "Hesaplanan Gun NM",
  "DZ",
  "HT",
  "RT",
  "YI",
  "MZ",
  "UI",
  "R",
  "Imza",
];

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

export default function MonthlyReportTable() {
  const [date, setDate] = useState<Date>(new Date());
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);
      setRows([]);

      try {
        const data = await buildMonthlyPuantaj(
          startOfMonth(date),
          endOfMonth(date),
        );

        if (active) {
          setRows(data);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Puantaj yuklenemedi");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [date]);

  const getExportRows = (): (string | number)[][] =>
    rows.map((row, index) => {
      const r = row.report;

      return [
        index + 1,
        row.name,
        minutesToTime(r.expectedWorkMinutes),
        minutesToTime(r.expectedNormalMinutes),
        minutesToTime(r.totalWorkMinutes),
        minutesToTime(r.normalMinutes),
        minutesToTime(r.overtimeMinutes),
        "00:00",
        minutesToTime(r.missingMinutes),
        r.absentDays,
        r.weekendDays,
        r.holidayDays,
        r.annualLeaveDays,
        r.otherLeaveDays,
        r.reportDays,
        r.expectedWorkDays,
        r.expectedWorkDays,
        r.workedDays,
        r.workedDays,
        r.workedDays,
        r.absentDays,
        r.weekendDays,
        r.holidayDays,
        r.annualLeaveDays,
        r.otherLeaveDays,
        r.unpaidLeaveDays,
        r.reportDays,
        "",
      ];
    });

  const handleExportPdf = async (): Promise<void> => {
    const pdfMakeInstance = await loadPdfMake();
    const monthLabel = date.toLocaleString("tr-TR", {
      month: "long",
      year: "numeric",
    });

    pdfMakeInstance
      .createPdf({
        pageOrientation: "landscape",
        pageSize: "A3",
        content: [
          {
            text: `${monthLabel} Detayli Puantaj Raporu`,
            bold: true,
            margin: [0, 0, 0, 10],
          },
          {
            table: {
              headerRows: 1,
              body: [exportColumns, ...getExportRows()],
            },
            layout: "lightHorizontalLines",
          },
        ],
        defaultStyle: {
          fontSize: 6,
        },
      })
      .download(`mesaitak-puantaj-${date.getFullYear()}-${date.getMonth() + 1}.pdf`);
  };

  const handleExportExcel = async (): Promise<void> => {
    const ExcelJS = (await import("exceljs")).default;

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Detayli Puantaj");

    ws.addRow(exportColumns);

    const headerRow = ws.getRow(1);
    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: "center" };

    getExportRows().forEach((row) => {
      ws.addRow(row);
    });

    ws.columns.forEach((column, index) => {
      column.width = index === 1 ? 24 : 12;
    });

    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer]);
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `mesaitak-puantaj-${date.getFullYear()}-${date.getMonth() + 1}.xlsx`;
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-gray-800">
          {date.toLocaleString("tr-TR", {
            month: "long",
            year: "numeric",
          })}
        </h2>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="success"
            size="sm"
            icon={<FileDown size={16} />}
            onClick={handleExportPdf}
            disabled={loading || rows.length === 0}
          >
            PDF Indir
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<FileDown size={16} />}
            onClick={handleExportExcel}
            disabled={loading || rows.length === 0}
          >
            Excel Indir
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<ChevronLeft size={16} />}
            onClick={() =>
              setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1))
            }
          />
          <Button
            variant="secondary"
            size="sm"
            icon={<ChevronRight size={16} />}
            onClick={() =>
              setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1))
            }
          />
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="bg-white rounded-xl shadow border overflow-x-auto">
        <table className="min-w-[1500px] w-full text-xs border-collapse">
          <thead className="bg-gray-100 text-gray-700 uppercase">
            <tr>
              <th rowSpan={2} className="border p-3">
                Sicil No
              </th>
              <th rowSpan={2} className="border p-3">
                Ad Soyad
              </th>

              <th colSpan={2} className="border p-3 text-center">
                Beklenen Süre
              </th>

              <th colSpan={11} className="border p-3 text-center">
                Hesaplanan Süre
              </th>

              <th colSpan={2} className="border p-3 text-center">
                Beklenen Gün
              </th>

              <th colSpan={10} className="border p-3 text-center">
                Hesaplanan Gün
              </th>

              <th rowSpan={2} className="border p-3 w-28">
                İmza
              </th>
            </tr>

            <tr>
              <th className="border p-2">TÇ</th>
              <th className="border p-2">NM</th>

              <th className="border p-2">TÇ</th>
              <th className="border p-2">NM</th>
              <th className="border p-2">FM</th>
              <th className="border p-2">FM (RT)</th>
              <th className="border p-2">EM</th>
              <th className="border p-2">DZ</th>
              <th className="border p-2">HT</th>
              <th className="border p-2">RT</th>
              <th className="border p-2">Yİ</th>
              <th className="border p-2">MZ</th>
              <th className="border p-2">R</th>

              <th className="border p-2">ÇG</th>
              <th className="border p-2">TÇ</th>

              <th className="border p-2">NM</th>
              <th className="border p-2">TÇ</th>
              <th className="border p-2">NM</th>
              <th className="border p-2">DZ</th>
              <th className="border p-2">HT</th>
              <th className="border p-2">RT</th>
              <th className="border p-2">Yİ</th>
              <th className="border p-2">MZ</th>
              <th className="border p-2">Üİ</th>
              <th className="border p-2">R</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={28}
                  className="border p-6 text-center text-gray-500"
                >
                  Yukleniyor...
                </td>
              </tr>
            ) : null}

            {!loading && rows.length === 0 ? (
              <tr>
                <td
                  colSpan={28}
                  className="border p-6 text-center text-gray-500"
                >
                  Kayit bulunamadi.
                </td>
              </tr>
            ) : null}

            {rows.map((row, index) => {
              const r = row.report;

              return (
                <tr
                  key={row.sicilNo}
                  className="text-center hover:bg-gray-50 transition"
                >
                  <td className="border p-2">{index + 1}</td>

                  <td className="border p-2 text-left pl-4">{row.name}</td>

                  <td className="border p-2">
                    {minutesToTime(r.expectedWorkMinutes)}
                  </td>

                  <td className="border p-2">
                    {minutesToTime(r.expectedNormalMinutes)}
                  </td>

                  <td className="border p-2">
                    {minutesToTime(r.totalWorkMinutes)}
                  </td>

                  <td className="border p-2">
                    {minutesToTime(r.normalMinutes)}
                  </td>

                  <td className="border p-2">
                    {minutesToTime(r.overtimeMinutes)}
                  </td>

                  <td className="border p-2">00:00</td>

                  <td className="border p-2">
                    {minutesToTime(r.missingMinutes)}
                  </td>

                  <td className="border p-2">{r.absentDays}</td>

                  <td className="border p-2">{r.weekendDays}</td>

                  <td className="border p-2">{r.holidayDays}</td>

                  <td className="border p-2">{r.annualLeaveDays}</td>

                  <td className="border p-2">{r.otherLeaveDays}</td>

                  <td className="border p-2">{r.reportDays}</td>

                  <td className="border p-2">{r.expectedWorkDays}</td>

                  <td className="border p-2">{r.expectedWorkDays}</td>

                  <td className="border p-2">{r.workedDays}</td>

                  <td className="border p-2">{r.workedDays}</td>

                  <td className="border p-2">{r.workedDays}</td>

                  <td className="border p-2">{r.absentDays}</td>

                  <td className="border p-2">{r.weekendDays}</td>

                  <td className="border p-2">{r.holidayDays}</td>

                  <td className="border p-2">{r.annualLeaveDays}</td>

                  <td className="border p-2">{r.otherLeaveDays}</td>

                  <td className="border p-2">{r.unpaidLeaveDays}</td>

                  <td className="border p-2">{r.reportDays}</td>

                  <td className="border p-2 h-14"></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <LegendTable />
    </div>
  );
}
