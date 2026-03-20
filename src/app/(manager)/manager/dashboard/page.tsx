"use client";

import { useEffect } from "react";
import { useCompaniesStore } from "@/features/companies/companies.store";
import { useSubscriptionsStore } from "@/features/subscriptions/subscriptions.store";
import StatCard from "@/components/StatCard";

export default function ManagerDashboardPage() {
  const {
    companies,
    fetchCompanies,
    loading: companiesLoading,
  } = useCompaniesStore();

  const {
    subscriptions,
    fetchSubscriptions,
    loading: subsLoading,
  } = useSubscriptionsStore();

  useEffect(() => {
    fetchCompanies();
    fetchSubscriptions();
  }, [fetchCompanies, fetchSubscriptions]);

  const totalCompanies = companies.length;

  const activeSubscriptions = subscriptions.filter(
    (s) => s.status === "active",
  ).length;

  const planStats = companies.reduce<Record<string, number>>((acc, c) => {
    const key = c.planId ?? "FREE";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const latestCompanies = companies.slice(0, 5);

  if (companiesLoading || subsLoading) {
    return <div className="p-6">Yükleniyor...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Manager Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Toplam Şirket" value={totalCompanies} />
        <StatCard title="Aktif Abonelik" value={activeSubscriptions} />
        <StatCard
          title="Toplam Plan Türü"
          value={Object.keys(planStats).length}
        />
      </div>

      <div className="bg-white rounded-xl p-4 shadow">
        <h2 className="font-semibold mb-3">Plan Dağılımı</h2>

        <div className="space-y-2">
          {Object.entries(planStats).map(([plan, count]) => (
            <div
              key={plan}
              className="flex justify-between border-b pb-1 text-sm"
            >
              <span>{plan}</span>
              <span>{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow">
        <h2 className="font-semibold mb-3">Son Eklenen Şirketler</h2>

        <div className="space-y-2">
          {latestCompanies.map((c) => (
            <div
              key={c.id}
              className="flex justify-between text-sm border-b pb-1"
            >
              <span>{c.name}</span>
              <span className="text-gray-500">{c.planId ?? "FREE"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
