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
import { subscribeTodayDashboard, DashboardStats } from "@/lib/db/dashboard";
import { listUsers } from "@/lib/db/users";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let mounted = true;

    (async () => {
      setLoading(true);

      const users = await listUsers();

      const usersWithShift = users.filter((u) => u.companyId && u.branchId);

      unsubscribe = subscribeTodayDashboard(usersWithShift.length, (data) => {
        if (mounted) {
          setStats(data);
          setLoading(false);
        }
      });
    })();

    return () => {
      mounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  if (loading || !stats) {
    return <div className="p-6">Yükleniyor…</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Stat
          label="Bugün işe gelen"
          value={stats.arrived}
          icon={UserCheck}
          color="text-green-600"
        />

        <Stat
          label="Geç kalan"
          value={stats.late}
          icon={ClockAlert}
          color="text-orange-600"
        />

        <Stat
          label="Şu an çalışan"
          value={stats.working}
          icon={Activity}
          color="text-blue-600"
        />

        <Stat
          label="Şu an molada"
          value={stats.onBreak}
          icon={Coffee}
          color="text-yellow-600"
        />

        <Stat
          label="Bugün gelmeyen"
          value={stats.absent}
          icon={UserX}
          color="text-red-600"
        />

        <Stat
          label="Erken çıkan"
          value={stats.earlyLeave}
          icon={LogOut}
          color="text-purple-600"
        />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
  color = "text-gray-700",
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color?: string;
}) {
  return (
    <div className="border rounded-xl p-4 flex items-center justify-between">
      <div>
        <div className="text-sm text-gray-500">{label}</div>
        <div className="text-3xl font-semibold mt-2">{value}</div>
      </div>

      <div
        className={`w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center ${color}`}
      >
        <Icon size={20} />
      </div>
    </div>
  );
}
