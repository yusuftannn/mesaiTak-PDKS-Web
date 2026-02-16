const holidays2026 = [
  { date: "01.01.2026", name: "Yılbaşı" },
  { date: "19.03.2026", name: "Ramazan Bayramı (1. Gün)" },
  { date: "20.03.2026", name: "Ramazan Bayramı (2. Gün)" },
  { date: "21.03.2026", name: "Ramazan Bayramı (3. Gün)" },
  { date: "23.04.2026", name: "Ulusal Egemenlik ve Çocuk Bayramı" },
  { date: "01.05.2026", name: "Emek ve Dayanışma Günü" },
  { date: "19.05.2026", name: "Atatürk’ü Anma, Gençlik ve Spor Bayramı" },
  { date: "26.05.2026", name: "Kurban Bayramı (1. Gün)" },
  { date: "27.05.2026", name: "Kurban Bayramı (2. Gün)" },
  { date: "28.05.2026", name: "Kurban Bayramı (3. Gün)" },
  { date: "29.05.2026", name: "Kurban Bayramı (4. Gün)" },
  { date: "30.08.2026", name: "Zafer Bayramı" },
  { date: "29.10.2026", name: "Cumhuriyet Bayramı" },
];

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
