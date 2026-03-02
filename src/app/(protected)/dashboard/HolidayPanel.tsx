import { holidays2026 } from "@/lib/db/constants/holidays";

function getDayName(dateStr: string) {
  const [day, month, year] = dateStr.split(".");
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  return date.toLocaleDateString("tr-TR", {
    weekday: "long",
  });
}

export default function HolidayPanel() {
  return (
    <div className="bg-white shadow-sm rounded-xl p-6 h-fit">
      <h2 className="text-lg font-semibold mb-6">2026 Resmi Tatiller</h2>

      <div className="space-y-4 overflow-y-auto pr-2">
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
  );
}
