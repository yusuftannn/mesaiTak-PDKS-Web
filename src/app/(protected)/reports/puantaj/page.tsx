import MonthlyReportTable from "./MonthlyReportTable";

export default function MonthlyReportPage() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">
          Puantaj (Özet Görünüm)
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Personel bazlı çalışma süreleri ve gün hesaplamaları
        </p>
      </div>

      <MonthlyReportTable />
    </div>
  );
}
