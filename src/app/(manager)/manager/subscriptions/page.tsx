"use client";

import { useEffect, useState } from "react";
import { useSubscriptionsStore } from "@/features/subscriptions/subscriptions.store";
import {
  createSubscription,
  updateSubscriptionPlanWithDates,
  updateSubscriptionStatus,
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

  const handleCreate = async (data: {
    companyId: string;
    planId: PlanId;
    status: SubscriptionStatus;
    startDate: Date;
    endDate: Date | null;
  }) => {
    await createSubscription(data);
    await fetchSubscriptions();
  };

  const handleUpdate = async (data: {
    companyId: string;
    planId: PlanId;
    status: SubscriptionStatus;
    startDate: Date;
    endDate: Date | null;
  }) => {
    if (!editing) return;

    const selectedPlan = plans.find((p) => p.id === data.planId);
    if (!selectedPlan) return;

    await updateSubscriptionPlanWithDates(
      editing.id,
      selectedPlan,
      data.startDate,
    );

    await updateSubscriptionStatus(editing.id, data.status);

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

  const getCompanyName = (companyId: string) => {
    return companies.find((c) => c.id === companyId)?.name ?? companyId;
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Subscriptions</h1>
          <p className="text-sm text-gray-500">Abonelikleri buradan yönet</p>
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
              <th>Status</th>
              <th>Başlangıç</th>
              <th>Bitiş</th>
            </tr>
          </thead>

          <tbody>
            {subscriptions.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-6 text-gray-500">
                  Henüz abonelik yok
                </td>
              </tr>
            ) : (
              subscriptions.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="p-3 font-medium">
                    {getCompanyName(s.companyId)}
                  </td>

                  <td>
                    {plans.find((p) => p.id === s.planId)?.name ?? s.planId}
                  </td>

                  <td>{getStatusBadge(s.status)}</td>

                  <td>{s.startDate.toLocaleDateString("tr-TR")}</td>

                  <td>
                    {s.endDate ? s.endDate.toLocaleDateString("tr-TR") : "-"}
                  </td>

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
              ))
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
