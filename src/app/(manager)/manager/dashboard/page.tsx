"use client";

import { useEffect, useMemo } from "react";
import { useCompaniesStore } from "@/features/companies/companies.store";
import { useSubscriptionsStore } from "@/features/subscriptions/subscriptions.store";
import { usePlansStore } from "@/features/plans/plans.store";
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

  const { plans, fetchPlans, loading: plansLoading } = usePlansStore();

  useEffect(() => {
    fetchCompanies();
    fetchSubscriptions();
    fetchPlans();
  }, [fetchCompanies, fetchSubscriptions, fetchPlans]);

  const planMap = useMemo(() => {
    return plans.reduce<Record<string, string>>((acc, p) => {
      acc[p.id] = p.name;
      return acc;
    }, {});
  }, [plans]);

  const subscriptionMap = useMemo(() => {
    return subscriptions.reduce<Record<string, (typeof subscriptions)[number]>>(
      (acc, sub) => {
        if (sub.status !== "canceled") {
          acc[sub.companyId] = sub;
        }
        return acc;
      },
      {},
    );
  }, [subscriptions]);

  const totalCompanies = companies.length;

  const activeSubscriptions = useMemo(
    () => subscriptions.filter((s) => s.status === "active").length,
    [subscriptions],
  );

  const trialSubscriptions = useMemo(
    () => subscriptions.filter((s) => s.status === "trial").length,
    [subscriptions],
  );

  const planStats = useMemo(() => {
    return subscriptions.reduce<Record<string, number>>((acc, sub) => {
      if (sub.status === "canceled") return acc;

      const name = planMap[sub.planId] ?? "Ücretsiz";
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});
  }, [subscriptions, planMap]);

  const companiesWithPlan = useMemo(() => {
    return companies.map((c) => {
      const sub = subscriptionMap[c.id];

      return {
        ...c,
        planName: sub ? (planMap[sub.planId] ?? "Ücretsiz") : "Ücretsiz",
        status: sub?.status ?? "none",
      };
    });
  }, [companies, subscriptionMap, planMap]);

  const latestCompanies = companiesWithPlan.slice(0, 5);

  if (companiesLoading || subsLoading || plansLoading) {
    return <div className="p-6">Yükleniyor...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Manager Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Toplam Şirket" value={totalCompanies} />
        <StatCard title="Aktif Abonelik" value={activeSubscriptions} />
        <StatCard title="Trial" value={trialSubscriptions} />
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

              <div className="flex items-center gap-2">
                <span className="text-gray-500">{c.planName}</span>

                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    c.status === "active"
                      ? "bg-green-100 text-green-700"
                      : c.status === "trial"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {c.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
