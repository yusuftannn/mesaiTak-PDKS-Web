"use client";

import { PlanInput } from "@/features/plans/plans.types";
import { useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (data: PlanInput) => Promise<void>;
  form: PlanInput;
  setForm: React.Dispatch<React.SetStateAction<PlanInput>>;
};

export default function PlanModal({
  open,
  onClose,
  onSave,
  form,
  setForm,
}: Props) {
  const [featuresText, setFeaturesText] = useState(form.features.join(", "));
  if (!open) return null;

  const handleChange = <K extends keyof PlanInput>(
    field: K,
    value: PlanInput[K],
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    const parsed = featuresText
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean);

    await onSave({
      ...form,
      features: parsed,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-lg">
        <h2 className="text-lg font-semibold mb-4">
          {form.id ? "Plan Güncelle" : "Yeni Plan"}
        </h2>

        <div className="space-y-3">
          <label className="text-sm text-gray-600">Plan Adı:</label>
          <input
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Plan adı"
            className="border p-2 w-full rounded"
          />

          <label className="text-sm text-gray-600">Fiyat:</label>
          <input
            type="number"
            value={form.price}
            onChange={(e) => handleChange("price", Number(e.target.value))}
            placeholder="Fiyat"
            className="border p-2 w-full rounded"
          />

          <label className="text-sm text-gray-600">Kullanıcı Limiti:</label>
          <input
            type="number"
            value={form.userLimit}
            onChange={(e) => handleChange("userLimit", Number(e.target.value))}
            placeholder="Kullanıcı limiti"
            className="border p-2 w-full rounded"
          />

          <label className="text-sm text-gray-600">Özellikler</label>
          <textarea
            value={featuresText}
            onChange={(e) => setFeaturesText(e.target.value)}
            placeholder="Özellikler (virgülle ayrılmış)"
            className="border p-2 w-full rounded min-h-[80px]"
          />

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
      </div>
    </div>
  );
}
