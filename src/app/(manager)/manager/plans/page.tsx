"use client";

import { useEffect, useState } from "react";
import { usePlansStore } from "@/features/plans/plans.store";
import { upsertPlan, deletePlan } from "@/features/plans/plans.service";
import { Plan, PlanId } from "@/features/plans/plans.types";

export default function PlansPage() {
  const { plans, loading, fetchPlans } = usePlansStore();

  const [editing, setEditing] = useState<Plan | null>(null);
  const [form, setForm] = useState({
    id: "FREE" as PlanId,
    name: "",
    price: 0,
    userLimit: 1,
    features: "",
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const startEdit = (plan: Plan) => {
    setEditing(plan);
    setForm({
      id: plan.id,
      name: plan.name,
      price: plan.price,
      userLimit: plan.userLimit,
      features: plan.features.join(", "),
    });
  };

  const resetForm = () => {
    setEditing(null);
    setForm({
      id: "FREE",
      name: "",
      price: 0,
      userLimit: 1,
      features: "",
    });
  };

  const handleSave = async () => {
    await upsertPlan({
      id: form.id,
      name: form.name,
      price: form.price,
      userLimit: form.userLimit,
      features: form.features.split(",").map((f) => f.trim()),
    });

    await fetchPlans();
    resetForm();
  };

  const handleDelete = async (id: PlanId) => {
    if (!confirm("Bu plan silinsin mi?")) return;

    await deletePlan(id);
    await fetchPlans();
  };

  if (loading) return <div className="p-6">Yükleniyor...</div>;

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Plan Yönetimi</h1>
        <p className="text-sm text-gray-500">
          SaaS planlarını buradan yönetebilirsiniz
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid md:grid-cols-2 gap-4">
          {plans.map((plan) => {
            const isEditing = editing?.id === plan.id;

            return (
              <div
                key={plan.id}
                className={`border rounded-2xl p-5 transition shadow-sm hover:shadow-md
                ${isEditing ? "border-black ring-2 ring-black" : ""}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-semibold">{plan.name}</h2>
                    <p className="text-xs text-gray-500">{plan.id}</p>
                  </div>

                  {plan.price === 0 ? (
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      Ücretsiz
                    </span>
                  ) : (
                    <span className="text-sm font-semibold">
                      {plan.price} ₺
                    </span>
                  )}
                </div>

                <p className="text-sm mt-3">👥 {plan.userLimit} kullanıcı</p>

                <div className="flex flex-wrap gap-2 mt-3">
                  {plan.features.map((f, i) => (
                    <span
                      key={i}
                      className="text-xs bg-gray-100 px-2 py-1 rounded"
                    >
                      {f}
                    </span>
                  ))}
                </div>

                <div className="flex gap-3 mt-5">
                  <button
                    onClick={() => startEdit(plan)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Düzenle
                  </button>

                  <button
                    onClick={() => handleDelete(plan.id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Sil
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border rounded-2xl p-5 h-fit sticky top-6">
          <h2 className="font-semibold mb-4">
            {editing ? "Plan Güncelle" : "Yeni Plan"}
          </h2>

          <div className="space-y-3">
            <select
              value={form.id}
              onChange={(e) =>
                setForm({ ...form, id: e.target.value as PlanId })
              }
              className="border p-2 w-full rounded"
            >
              <option value="FREE">FREE</option>
              <option value="PRO">PRO</option>
              <option value="ENTERPRISE">ENTERPRISE</option>
            </select>

            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Plan adı"
              className="border p-2 w-full rounded"
            />

            <input
              type="number"
              value={form.price}
              onChange={(e) =>
                setForm({ ...form, price: Number(e.target.value) })
              }
              placeholder="Fiyat"
              className="border p-2 w-full rounded"
            />

            <input
              type="number"
              value={form.userLimit}
              onChange={(e) =>
                setForm({
                  ...form,
                  userLimit: Number(e.target.value),
                })
              }
              placeholder="Kullanıcı limiti"
              className="border p-2 w-full rounded"
            />

            <textarea
              value={form.features}
              onChange={(e) => setForm({ ...form, features: e.target.value })}
              placeholder="Features (virgülle)"
              className="border p-2 w-full rounded min-h-[80px]"
            />

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSave}
                className="bg-black text-white px-4 py-2 rounded w-full"
              >
                Kaydet
              </button>

              {editing && (
                <button
                  onClick={resetForm}
                  className="px-4 py-2 border rounded w-full"
                >
                  İptal
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
