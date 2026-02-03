"use client";

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
        <Stat label="Bugün işe gelen" value={stats.arrived} />
        <Stat label="Geç kalan" value={stats.late} />
        <Stat label="Şu an çalışan" value={stats.working} />
        <Stat label="Şu an molada" value={stats.onBreak} />
        <Stat label="Bugün gelmeyen" value={stats.absent} />
        <Stat label="Erken çıkan" value={stats.earlyLeave} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border rounded-xl p-4">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-3xl font-semibold mt-2">{value}</div>
    </div>
  );
}
