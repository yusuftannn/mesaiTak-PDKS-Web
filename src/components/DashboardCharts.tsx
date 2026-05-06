"use client";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import { DashboardStats } from "@/features/dashboard/dashboard.types";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
);

type Props = {
  stats: DashboardStats;
};

export default function DashboardCharts({ stats }: Props) {
  const labels = [
    "Gelen",
    "Geç",
    "Çalışıyor",
    "Molada",
    "Gelmedi",
    "Erken Çıktı",
  ];

  const values = [
    stats.arrived.count,
    stats.late.count,
    stats.working.count,
    stats.onBreak.count,
    stats.absent.count,
    stats.earlyLeave.count,
  ];

  const colors = [
    "#14B8A6",
    "#0F766E",
    "#1E293B",
    "#64748B",
    "#EF4444",
    "#0F172A",
  ];

  const pieData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        borderWidth: 1,
      },
    ],
  };

  const barData = {
    labels,
    datasets: [
      {
        label: "Kişi Sayısı",
        data: values,
        backgroundColor: colors,
      },
    ],
  };
  const total = values.reduce((a, b) => a + b, 0);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Genel Dağılım</h3>

        {total === 0 ? (
          <div className="h-62.5 flex items-center justify-center text-gray-400 text-sm">
            Henüz veri yok
          </div>
        ) : (
          <Pie data={pieData} />
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Karşılaştırma</h3>
        <Bar data={barData} />
      </div>
    </div>
  );
}
