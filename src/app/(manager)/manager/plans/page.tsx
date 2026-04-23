"use client";

import { useEffect, useState, useMemo } from "react";
import { usePlansStore } from "@/features/plans/plans.store";
import { upsertPlan, deletePlan } from "@/features/plans/plans.service";
import { Plan, PlanInput, PlanId } from "@/features/plans/plans.types";
import PlanModal from "./PlanModal";

export default function PlansPage() {
  const { plans, loading, fetchPlans } = usePlansStore();

  const [form, setForm] = useState<PlanInput>({
    id: undefined,
    name: "",
    pricePerUser: 0,
    pricePerBranch: 0,
    minUser: undefined,
    maxUser: undefined,
  });

  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const sortedPlans = useMemo(() => {
    return [...plans].sort((a, b) => a.pricePerUser - b.pricePerUser);
  }, [plans]);

  const openCreate = () => {
    setForm({
      id: undefined,
      name: "",
      pricePerUser: 0,
      pricePerBranch: 0,
      minUser: undefined,
      maxUser: undefined,
    });
    setModalOpen(true);
  };

  const openEdit = (plan: Plan) => {
    setForm({
      id: plan.id,
      name: plan.name,
      pricePerUser: plan.pricePerUser,
      pricePerBranch: plan.pricePerBranch,
      minUser: plan.minUser,
      maxUser: plan.maxUser,
    });
    setModalOpen(true);
  };

  const handleSave = async (data: PlanInput) => {
    await upsertPlan(data);
    await fetchPlans();
    setModalOpen(false);
  };

  const handleDelete = async (id: PlanId) => {
    if (!confirm("Plan silinsin mi?")) return;

    await deletePlan(id);
    await fetchPlans();
  };

  if (loading && plans.length === 0) {
    return <div className="p-6">Yükleniyor...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Planlar</h1>
          <p className="text-sm text-gray-500">
            Kullanıcı ve şube bazlı fiyatlandırma yönetimi
          </p>
        </div>

        <button
          onClick={openCreate}
          className="bg-black text-white px-4 py-2 rounded hover:opacity-90"
        >
          + Yeni Plan
        </button>
      </div>

      <div className="border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Plan</th>
              <th>Kullanıcı ₺</th>
              <th>Şube ₺</th>
              <th>Kullanıcı Aralığı</th>
              <th className="text-right p-3">İşlem</th>
            </tr>
          </thead>

          <tbody>
            {sortedPlans.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3 font-medium">{p.name}</td>

                <td>
                  {p.pricePerUser === 0 ? "Ücretsiz" : `${p.pricePerUser} ₺`}
                </td>

                <td>
                  {p.pricePerBranch === 0
                    ? "Ücretsiz"
                    : `${p.pricePerBranch} ₺`}
                </td>

                <td className="text-xs text-gray-500">
                  {p.minUser || p.maxUser
                    ? `${p.minUser ?? 0} - ${p.maxUser ?? "∞"}`
                    : "-"}
                </td>

                <td className="p-3 text-right space-x-3">
                  <button
                    onClick={() => openEdit(p)}
                    className="text-blue-600 hover:underline"
                  >
                    Düzenle
                  </button>

                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-red-600 hover:underline"
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))}

            {sortedPlans.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">
                  Henüz plan oluşturulmamış
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
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
