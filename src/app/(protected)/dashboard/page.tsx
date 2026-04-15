"use client";

import {
  UserCheck,
  ClockAlert,
  Activity,
  Coffee,
  UserX,
  LogOut,
} from "lucide-react";
import { useEffect, useState } from "react";
import { subscribeTodayDashboard } from "@/features/dashboard/dashboard.service";
import {
  DashboardStats,
  DashboardUser,
} from "@/features/dashboard/dashboard.types";
import { listUsers } from "@/features/users/users.service";
import HolidayPanel from "./HolidayPanel";
import UserRow from "./UserRow";
import DashboardCharts from "@/components/DashboardCharts";

const EMPTY_STATS: DashboardStats = {
  arrived: { count: 0, users: [] },
  late: { count: 0, users: [] },
  working: { count: 0, users: [] },
  onBreak: { count: 0, users: [] },
  absent: { count: 0, users: [] },
  earlyLeave: { count: 0, users: [] },
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let mounted = true;

    const init = async () => {
      setLoading(true);

      const users = await listUsers();
      const usersWithShift = users.filter((u) => u.companyId && u.branchId);

      unsubscribe = await subscribeTodayDashboard(usersWithShift, (data) => {
        if (mounted) {
          setStats(data);
          setLoading(false);
        }
      });
    };

    init();

    return () => {
      mounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-gray-500 animate-pulse">
        Dashboard yükleniyor...
      </div>
    );
  }

  return (
    <div className="p-8 space-y-10 bg-linear-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Günlük Özet</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {new Date().toLocaleDateString("tr-TR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        <Stat label="Bugün işe gelen" value={stats.arrived} icon={UserCheck} />
        <Stat label="Geç kalan" value={stats.late} icon={ClockAlert} />
        <Stat label="Şu an çalışan" value={stats.working} icon={Activity} />
        <Stat label="Şu an molada" value={stats.onBreak} icon={Coffee} />
        <Stat label="Bugün gelmeyen" value={stats.absent} icon={UserX} />
        <Stat label="Erken çıkan" value={stats.earlyLeave} icon={LogOut} />
      </div>

      <DashboardCharts stats={stats} />

      <HolidayPanel />
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: { count: number; users: DashboardUser[] };
  icon: React.ElementType;
}) {
  return (
    <div className="group relative bg-white/80 backdrop-blur border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl p-6 flex flex-col">
      <div className="absolute top-4 right-4 bg-gray-100 group-hover:bg-black text-gray-500 group-hover:text-white p-2 rounded-lg transition">
        <Icon size={20} />
      </div>

      <div className="text-sm text-gray-500">{label}</div>

      <div className="text-4xl font-semibold mt-3 tracking-tight">
        {value.count}
      </div>

      {value.users.length > 0 && (
        <div className="mt-5 max-h-40 overflow-y-auto space-y-2 pr-1 border-t pt-4 border-gray-200 scrollbar-thin">
          {value.users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 transition"
            >
              <UserRow user={user} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
