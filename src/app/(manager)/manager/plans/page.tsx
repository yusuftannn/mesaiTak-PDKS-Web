"use client";

import { useEffect, useState } from "react";
import { usePlansStore } from "@/features/plans/plans.store";
import { upsertPlan, deletePlan } from "@/features/plans/plans.service";
import { Plan, PlanInput, PlanId } from "@/features/plans/plans.types";
import PlanModal from "./PlanModal";

export default function PlansPage() {
  const { plans, loading, fetchPlans } = usePlansStore();
  const [form, setForm] = useState<PlanInput>({
    id: undefined,
    name: "",
    price: 0,
    userLimit: 1,
    features: [],
  });
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const openCreate = () => {
    setForm({
      id: undefined,
      name: "",
      price: 0,
      userLimit: 1,
      features: [],
    });
    setModalOpen(true);
  };

  const openEdit = (plan: Plan) => {
    setForm({
      id: plan.id,
      name: plan.name,
      price: plan.price,
      userLimit: plan.userLimit,
      features: plan.features,
    });
    setModalOpen(true);
  };

  const handleSave = async (data: PlanInput) => {
    await upsertPlan(data);
    await fetchPlans();
  };

  const handleDelete = async (id: PlanId) => {
    if (!confirm("Silinsin mi?")) return;

    await deletePlan(id);
    await fetchPlans();
  };

  if (loading) return <div className="p-6">Yükleniyor...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Planlar</h1>
          <p className="text-sm text-gray-500">Tüm planları buradan yönet</p>
        </div>

        <button
          onClick={openCreate}
          className="bg-black text-white px-4 py-2 rounded"
        >
          + Yeni Plan
        </button>
      </div>

      <div className="border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Plan</th>
              <th>Fiyat</th>
              <th>Kullanıcı</th>
              <th>Features</th>
              <th className="text-right p-3">İşlem</th>
            </tr>
          </thead>

          <tbody>
            {[...plans]
              .sort((a, b) => a.price - b.price)
              .map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-3 font-medium">{p.name}</td>
                  <td>{p.price === 0 ? "Ücretsiz" : `${p.price} ₺`}</td>
                  <td>{p.userLimit}</td>
                  <td className="text-xs text-gray-500">
                    {p.features.join(", ")}
                  </td>

                  <td className="p-3 text-right space-x-3">
                    <button
                      onClick={() => openEdit(p)}
                      className="text-blue-600"
                    >
                      Düzenle
                    </button>

                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-red-600"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {modalOpen && form && (
        <PlanModal
          open={modalOpen}
          form={form}
          setForm={setForm}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
