"use client";

import { useEffect, useState } from "react";
import { Plan, PlanId } from "@/features/plans/plans.types";
import { SubscriptionStatus } from "@/features/subscriptions/subscriptions.types";
import { Company } from "@/features/companies/companies.types";

import { listCompanies } from "@/features/companies/companies.service";
import { listPlans } from "@/features/plans/plans.service";

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    companyId: string;
    planId: PlanId;
    status: SubscriptionStatus;
  }) => Promise<void>;
};

export default function SubscriptionModal({ open, onClose, onSave }: Props) {
  const [form, setForm] = useState({
    companyId: "",
    planId: "" as PlanId,
    status: "trial" as SubscriptionStatus,
  });

  const [companies, setCompanies] = useState<Company[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);

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

      if (plansData.length > 0) {
        setForm((prev) => ({
          ...prev,
          planId: plansData[0].id,
        }));
      }

      setLoading(false);
    };

    fetchData();
  }, [open]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!form.companyId || !form.planId) return;

    await onSave(form);
    onClose();
  };

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
              onChange={(e) => setForm({ ...form, companyId: e.target.value })}
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
              onChange={(e) =>
                setForm({ ...form, planId: e.target.value as PlanId })
              }
              className="border p-2 w-full rounded"
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.price}₺)
                </option>
              ))}
            </select>

            <select
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value as SubscriptionStatus,
                })
              }
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
