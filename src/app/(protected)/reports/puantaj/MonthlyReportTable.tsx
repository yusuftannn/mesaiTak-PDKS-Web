"use client";

import { useEffect, useState } from "react";
import LegendTable from "./LegendTable";
import { buildMonthlyPuantaj } from "@/lib/db/puantaj";
import { minutesToTime } from "@/lib/utils/time";

type PuantajReport = {
  totalWorkMinutes: number;
  normalMinutes: number;
  overtimeMinutes: number;
  missingMinutes: number;

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

export default function MonthlyReportTable() {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    async function load() {
      const start = new Date("2026-03-01");
      const end = new Date("2026-03-31");

      const data = await buildMonthlyPuantaj(start, end);

      setRows(data);
    }

    load();
  }, []);

  return (
    <div className="w-full space-y-6">
      <div className="bg-white rounded-xl shadow border overflow-x-auto">
        <table className="min-w-[2200px] w-full text-xs border-collapse">
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

              <th colSpan={10} className="border p-3 text-center">
                Hesaplanan Süre
              </th>

              <th colSpan={2} className="border p-3 text-center">
                Beklenen Gün
              </th>

              <th colSpan={11} className="border p-3 text-center">
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
                    {minutesToTime(r.normalMinutes)}
                  </td>

                  <td className="border p-2">
                    {minutesToTime(r.normalMinutes)}
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

                  <td className="border p-2">22</td>

                  <td className="border p-2">20</td>

                  <td className="border p-2">20</td>

                  <td className="border p-2">20</td>

                  <td className="border p-2">20</td>

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
