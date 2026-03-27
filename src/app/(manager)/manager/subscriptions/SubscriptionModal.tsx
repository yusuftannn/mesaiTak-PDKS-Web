"use client";

import { useEffect, useState } from "react";
import { Plan, PlanId } from "@/features/plans/plans.types";
import { SubscriptionStatus } from "@/features/subscriptions/subscriptions.types";
import { Company } from "@/features/companies/companies.types";

import { listCompanies } from "@/features/companies/companies.service";
import { listPlans } from "@/features/plans/plans.service";
import { FormState, Props } from "@/features/subscriptions/subscriptions.types";

export default function SubscriptionModal({ open, onClose, onSave }: Props) {
  const [form, setForm] = useState<FormState>({
    companyId: "",
    planId: "" as PlanId,
    status: "trial",
    startDate: "",
    endDate: "",
  });

  const [companies, setCompanies] = useState<Company[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const formatDate = (d: Date): string => d.toISOString().split("T")[0];

  const calculateEndDate = (plan: Plan, start: Date): string => {
    if (plan.durationType === "unlimited") return "";

    const d = new Date(start);

    if (plan.durationType === "days") {
      d.setDate(d.getDate() + (plan.duration ?? 0));
    }

    if (plan.durationType === "months") {
      d.setMonth(d.getMonth() + (plan.duration ?? 0));
    }

    if (plan.durationType === "years") {
      d.setFullYear(d.getFullYear() + (plan.duration ?? 0));
    }

    return formatDate(d);
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

      const today = formatDate(new Date());

      const firstPlan = plansData[0];

      setForm({
        companyId: "",
        planId: firstPlan?.id ?? ("" as PlanId),
        status: "trial",
        startDate: today,
        endDate: firstPlan ? calculateEndDate(firstPlan, new Date()) : "",
      });

      setLoading(false);
    };

    fetchData();
  }, [open]);

  const handlePlanChange = (planId: PlanId) => {
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;

    const start = form.startDate ? new Date(form.startDate) : new Date();

    const endDate = calculateEndDate(plan, start);

    setForm((prev) => ({
      ...prev,
      planId,
      endDate,
    }));
  };

  const handleStartDateChange = (startDate: string) => {
    const plan = plans.find((p) => p.id === form.planId);

    const endDate = plan ? calculateEndDate(plan, new Date(startDate)) : "";

    setForm((prev) => ({
      ...prev,
      startDate,
      endDate,
    }));
  };

  const handleSubmit = async () => {
    if (!form.companyId || !form.planId || !form.startDate) return;

    await onSave({
      companyId: form.companyId,
      planId: form.planId,
      status: form.status,
      startDate: new Date(form.startDate),
      endDate: form.endDate ? new Date(form.endDate) : null,
    });

    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold mb-4">Yeni Abonelik</h2>

        {loading ? (
          <div className="text-center py-6">Yükleniyor...</div>
        ) : (
          <div className="space-y-3">
            <select
              value={form.companyId}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  companyId: e.target.value,
                }))
              }
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
              value={form.planId}
              onChange={(e) => handlePlanChange(e.target.value as PlanId)}
              className="border p-2 w-full rounded"
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.price}₺ / {p.userLimit} kullanıcı)
                </option>
              ))}
            </select>

            <select
              value={form.status}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  status: e.target.value as SubscriptionStatus,
                }))
              }
              className="border p-2 w-full rounded"
            >
              <option value="trial">trial</option>
              <option value="active">active</option>
              <option value="canceled">canceled</option>
              <option value="expired">expired</option>
            </select>

            <div>
              <label className="text-sm text-gray-600">Başlangıç Tarihi</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="border p-2 w-full rounded"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Bitiş Tarihi</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    endDate: e.target.value,
                  }))
                }
                className="border p-2 w-full rounded"
              />
            </div>

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
