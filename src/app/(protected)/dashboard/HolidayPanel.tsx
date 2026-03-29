import { holidays2026 } from "@/constants/holidays";

function getDayName(dateStr: string) {
  const date = new Date(dateStr);

  if (isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("tr-TR", {
    weekday: "long",
  }).format(date);
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
