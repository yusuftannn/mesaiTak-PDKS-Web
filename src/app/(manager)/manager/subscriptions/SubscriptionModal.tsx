"use client";

import { useEffect, useState } from "react";
import { Plan, PlanId } from "@/features/plans/plans.types";
import { SubscriptionStatus } from "@/features/subscriptions/subscriptions.types";
import { Company } from "@/features/companies/companies.types";

import { listCompanies } from "@/features/companies/companies.service";
import { listPlans } from "@/features/plans/plans.service";
import { Props } from "@/features/subscriptions/subscriptions.types";

export default function SubscriptionModal({
  open,
  onClose,
  onSave,
  editing,
}: Props) {
  const [companyId, setCompanyId] = useState("");
  const [planId, setPlanId] = useState<PlanId>("" as PlanId);

  const [userCount, setUserCount] = useState(1);
  const [branchCount, setBranchCount] = useState(1);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">(
    "monthly",
  );
  const [status, setStatus] = useState<SubscriptionStatus>("trial");

  const [companies, setCompanies] = useState<Company[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);

  const calculatePrice = () => {
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return 0;

    return userCount * plan.pricePerUser + branchCount * plan.pricePerBranch;
  };

  useEffect(() => {
    if (!open) return;

    const fetchData = async () => {
      setLoading(true);

      const [companiesData, plansData] = await Promise.all([
        listCompanies(),
        listPlans(),
      ]);

      setCompanies(companiesData);
      setPlans(plansData);

      if (editing) {
        setCompanyId(editing.companyId);
        setPlanId(editing.planId);
        setUserCount(editing.userCount);
        setBranchCount(editing.branchCount);
        setStatus(editing.status);
      } else {
        setCompanyId("");
        setPlanId(plansData[0]?.id ?? ("" as PlanId));
        setUserCount(1);
        setBranchCount(1);
        setStatus("trial");
      }

      setLoading(false);
    };

    fetchData();
  }, [open, editing]);

  const handleSubmit = async () => {
    if (!companyId || !planId) return;

    await onSave({
      companyId,
      planId,
      userCount,
      branchCount,
      billingPeriod,
      status,
    });

    onClose();
  };

  if (!open) return null;

  const price = calculatePrice();

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold mb-4">
          {editing ? "Abonelik Düzenle" : "Yeni Abonelik"}
        </h2>

        {loading ? (
          <div className="text-center py-6">Yükleniyor...</div>
        ) : (
          <div className="space-y-4">
            {/* COMPANY */}
            <select
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              className="border p-2 w-full rounded"
            >
              <option value="">Şirket seç</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={billingPeriod}
              onChange={(e) =>
                setBillingPeriod(e.target.value as "monthly" | "yearly")
              }
              className="border p-2 w-full rounded"
            >
              <option value="monthly">Aylık</option>
              <option value="yearly">Yıllık</option>
            </select>

            {/* PLAN */}
            <select
              value={planId}
              onChange={(e) => setPlanId(e.target.value as PlanId)}
              className="border p-2 w-full rounded"
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.pricePerUser}₺ / kullanıcı, {p.pricePerBranch}₺ /
                  şube)
                </option>
              ))}
            </select>

            <div>
              <label className="text-sm text-gray-600">Kullanıcı Sayısı</label>
              <input
                type="number"
                value={userCount}
                min={1}
                onChange={(e) => setUserCount(Number(e.target.value))}
                className="border p-2 w-full rounded"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Şube Sayısı</label>
              <input
                type="number"
                value={branchCount}
                min={1}
                onChange={(e) => setBranchCount(Number(e.target.value))}
                className="border p-2 w-full rounded"
              />
            </div>

            <div className="bg-gray-100 rounded p-3 text-center">
              <div className="text-sm text-gray-500">Toplam Fiyat</div>
              <div className="text-xl font-bold">{price} ₺</div>
            </div>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as SubscriptionStatus)}
              className="border p-2 w-full rounded"
            >
              <option value="trial">trial</option>
              <option value="active">active</option>
              <option value="canceled">canceled</option>
              <option value="expired">expired</option>
            </select>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSubmit}
                className="bg-black text-white px-4 py-2 rounded w-full"
              >
                Kaydet
              </button>

              <button
                onClick={onClose}
                className="border px-4 py-2 rounded w-full"
              >
                İptal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
