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
import {
  subscribeTodayDashboard,
  DashboardStats,
  DashboardUser,
} from "@/lib/db/dashboard";
import { listUsers } from "@/lib/db/users";
import HolidayPanel from "./HolidayPanel";
import UserRow from "./UserRow";

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
    return <div className="p-6">Yükleniyor…</div>;
  }

  return (
    <div className="p-8 space-y-10">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Stat
          label="Bugün işe gelen"
          value={stats.arrived}
          icon={UserCheck}
          color="border-green-500 text-green-600"
        />
        <Stat
          label="Geç kalan"
          value={stats.late}
          icon={ClockAlert}
          color="border-orange-500 text-orange-600"
        />
        <Stat
          label="Şu an çalışan"
          value={stats.working}
          icon={Activity}
          color="border-blue-500 text-blue-600"
        />
        <Stat
          label="Şu an molada"
          value={stats.onBreak}
          icon={Coffee}
          color="border-yellow-500 text-yellow-600"
        />
        <Stat
          label="Bugün gelmeyen"
          value={stats.absent}
          icon={UserX}
          color="border-red-500 text-red-600"
        />
        <Stat
          label="Erken çıkan"
          value={stats.earlyLeave}
          icon={LogOut}
          color="border-purple-500 text-purple-600"
        />
      </div>

      <HolidayPanel />
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: { count: number; users: DashboardUser[] };
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div
      className={`relative border-l-4 ${color} bg-white shadow-sm rounded-xl p-6 flex flex-col`}
    >
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-4xl font-semibold mt-3">{value.count}</div>

      {value.users.length > 0 && (
        <div className="mt-4 max-h-40 overflow-y-auto space-y-3 pr-2 border-t pt-4 border-gray-300">
          {value.users.map((user) => (
            <UserRow key={user.id} user={user} />
          ))}
        </div>
      )}

      <div className="absolute top-4 right-4 opacity-30">
        <Icon size={28} />
      </div>
    </div>
  );
}
