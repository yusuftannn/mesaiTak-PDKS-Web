"use client";

import LegendTable from "./LegendTable";

export default function MonthlyReportTable() {
  return (
    <div className="w-full space-y-6">

      <div className="bg-white rounded-xl shadow border overflow-x-auto">

        <table className="min-w-[2200px] w-full text-xs border-collapse">

          <thead className="bg-gray-100 text-gray-700 uppercase">

            <tr>
              <th rowSpan={2} className="border p-3">Sicil No</th>
              <th rowSpan={2} className="border p-3">Ad Soyad</th>

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

            {[1, 2, 3, 4, 5].map((i) => (
              <tr
                key={i}
                className="text-center hover:bg-gray-50 transition"
              >
                <td className="border p-2">00000{i}</td>
                <td className="border p-2 text-left pl-4">
                  Personel {i}
                </td>

                {Array.from({ length: 25 }).map((_, idx) => (
                  <td key={idx} className="border p-2">
                    0
                  </td>
                ))}

                <td className="border p-2 h-14"></td>
              </tr>
            ))}

          </tbody>
        </table>

      </div>

      <LegendTable />

    </div>
  );
}