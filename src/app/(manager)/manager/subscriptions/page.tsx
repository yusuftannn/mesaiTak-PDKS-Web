"use client";

import { useEffect, useState } from "react";
import { useSubscriptionsStore } from "@/features/subscriptions/subscriptions.store";
import {
  createSubscription,
  updateSubscription,
  deleteSubscription,
} from "@/features/subscriptions/subscriptions.service";

import {
  Subscription,
  SubscriptionStatus,
} from "@/features/subscriptions/subscriptions.types";

import { PlanId, Plan } from "@/features/plans/plans.types";
import { Company } from "@/features/companies/companies.types";

import { listPlans } from "@/features/plans/plans.service";
import { listCompanies } from "@/features/companies/companies.service";

import SubscriptionModal from "./SubscriptionModal";

export default function SubscriptionsPage() {
  const { subscriptions, loading, fetchSubscriptions } =
    useSubscriptionsStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [editing, setEditing] = useState<Subscription | null>(null);

  useEffect(() => {
    fetchSubscriptions();

    const fetchMeta = async () => {
      const [plansData, companiesData] = await Promise.all([
        listPlans(),
        listCompanies(),
      ]);

      setPlans(plansData);
      setCompanies(companiesData);
    };

    fetchMeta();
  }, [fetchSubscriptions]);

  const calculatePrice = (
    plan: Plan | undefined,
    userCount: number,
    branchCount: number,
  ) => {
    if (!plan) return 0;

    return userCount * plan.pricePerUser + branchCount * plan.pricePerBranch;
  };

  const handleCreate = async (data: {
    companyId: string;
    planId: PlanId;
    userCount: number;
    branchCount: number;
    billingPeriod: "monthly" | "yearly";
    status: SubscriptionStatus;
  }) => {
    await createSubscription(data);
    await fetchSubscriptions();
  };

  const handleUpdate = async (data: {
    companyId: string;
    planId: PlanId;
    userCount: number;
    branchCount: number;
    billingPeriod: "monthly" | "yearly";
    status: SubscriptionStatus;
  }) => {
    if (!editing) return;

    await updateSubscription(editing.id, {
      planId: data.planId,
      userCount: data.userCount,
      branchCount: data.branchCount,
      billingPeriod: data.billingPeriod,
      status: data.status,
    });

    await fetchSubscriptions();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Silmek istediğine emin misin?")) return;

    await deleteSubscription(id);
    await fetchSubscriptions();
  };

  const handleEdit = (sub: Subscription) => {
    setEditing(sub);
    setModalOpen(true);
  };

  const getRemainingDays = (endDate: Date | null) => {
    if (!endDate) return null;

    const now = new Date();
    const diff = endDate.getTime() - now.getTime();

    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getCompanyName = (companyId: string) => {
    return companies.find((c) => c.id === companyId)?.name ?? companyId;
  };

  const getPlan = (planId: string) => {
    return plans.find((p) => p.id === planId);
  };

  const getStatusBadge = (status: SubscriptionStatus) => {
    const map = {
      trial: "bg-yellow-100 text-yellow-700",
      active: "bg-green-100 text-green-700",
      canceled: "bg-gray-200 text-gray-700",
      expired: "bg-red-100 text-red-700",
    };

    return (
      <span className={`px-2 py-1 rounded text-xs ${map[status]}`}>
        {status}
      </span>
    );
  };

  if (loading) return <div className="p-6">Yükleniyor...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h1 className="text-2xl font-bold">Abonelikler</h1>
          <p className="text-sm text-gray-500">
            Kullanım bazlı abonelik yönetimi
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="bg-black text-white px-4 py-2 rounded"
        >
          + Yeni Subscription
        </button>
      </div>

      <div className="border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Company</th>
              <th>Plan</th>
              <th>Kullanıcı</th>
              <th>Şube</th>
              <th>Fiyat</th>
              <th>Başlangıç</th>
              <th>Bitiş</th>
              <th>Kalan</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {subscriptions.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-6 text-gray-500">
                  Henüz abonelik yok
                </td>
              </tr>
            ) : (
              subscriptions.map((s) => {
                const plan = getPlan(s.planId);
                const price = calculatePrice(plan, s.userCount, s.branchCount);

                return (
                  <tr key={s.id} className="border-t">
                    <td className="p-3 font-medium">
                      {getCompanyName(s.companyId)}
                    </td>

                    <td>{plan?.name ?? s.planId}</td>

                    <td>{s.userCount}</td>

                    <td>{s.branchCount}</td>

                    <td className="font-medium">{price} ₺</td>
                    <td>{s.startDate.toLocaleDateString("tr-TR")}</td>

                    <td>
                      {s.endDate ? s.endDate.toLocaleDateString("tr-TR") : "-"}
                    </td>
                    <td>
                      {(() => {
                        const days = getRemainingDays(s.endDate);

                        if (days === null) return "-";
                        if (days <= 0)
                          return (
                            <span className="text-red-600">Süresi doldu</span>
                          );

                        return (
                          <span className="text-green-600">{days} gün</span>
                        );
                      })()}
                    </td>
                    <td>{getStatusBadge(s.status)}</td>

                    <td className="p-3 text-right space-x-3">
                      <button
                        onClick={() => handleEdit(s)}
                        className="text-blue-600 text-xs"
                      >
                        Düzenle
                      </button>

                      <button
                        onClick={() => handleDelete(s.id)}
                        className="text-red-600 text-xs"
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <SubscriptionModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSave={editing ? handleUpdate : handleCreate}
        editing={editing}
      />
    </div>
  );
}
