"use client";

import { useState } from "react";
import { holidays2026 } from "@/constants/holidays";

function getDayName(dateStr: string) {
  const date = new Date(dateStr);

  if (isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("tr-TR", {
    weekday: "long",
  }).format(date);
}

export default function HolidayPanel() {
  const [open, setOpen] = useState(false);

  const today = new Date();

  const upcoming = holidays2026
    .filter((h) => new Date(h.date) >= today)
    .sort((a, b) => +new Date(a.date) - +new Date(b.date))
    .slice(0, 3); 

  return (
    <>
      <div className="bg-white shadow-sm rounded-xl p-6 h-fit">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Yaklaşan Tatiller</h2>

          <button
            onClick={() => setOpen(true)}
            className="text-sm text-blue-600 hover:underline"
          >
            Tümünü Gör
          </button>
        </div>

        <div className="space-y-4">
          {upcoming.map((h, i) => {
            const dayName = getDayName(h.date);

            return (
              <div
                key={i}
                className="flex justify-between items-center border-b pb-3 last:border-none"
              >
                <div>
                  <div className="text-sm font-medium text-gray-800">
                    {h.name}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {dayName}
                  </div>
                </div>

                <div className="text-sm font-semibold text-gray-700">
                  {h.date}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">2026 Resmi Tatiller</h3>
              <button onClick={() => setOpen(false)}>✕</button>
            </div>

            <div className="max-h-100 overflow-y-auto space-y-4 pr-2">
              {holidays2026.map((h, i) => {
                const dayName = getDayName(h.date);

                return (
                  <div
                    key={i}
                    className="flex justify-between items-center border-b pb-3"
                  >
                    <div>
                      <div className="text-sm font-medium text-gray-800">
                        {h.name}
                      </div>
                      <div className="text-xs text-gray-500 capitalize">
                        {dayName}
                      </div>
                    </div>

                    <div className="text-sm font-semibold text-gray-700">
                      {h.date}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
