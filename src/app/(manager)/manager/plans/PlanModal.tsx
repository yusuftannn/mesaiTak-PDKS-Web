"use client";

import { Props, PlanInput } from "@/features/plans/plans.types";
import { useState } from "react";

export default function PlanModal({
  open,
  onClose,
  onSave,
  form,
  setForm,
}: Props) {
  const [error, setError] = useState<string | null>(null);

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

  const validate = () => {
    if (!form.name.trim()) return "Plan adı zorunlu";

    if (form.pricePerUser < 0) return "Kullanıcı fiyatı negatif olamaz";
    if (form.pricePerBranch < 0) return "Şube fiyatı negatif olamaz";

    if (
      form.minUser !== undefined &&
      form.maxUser !== undefined &&
      form.minUser > form.maxUser
    ) {
      return "Min kullanıcı, max kullanıcıdan büyük olamaz";
    }

    return null;
  };

  const handleSubmit = async () => {
    const err = validate();

    if (err) {
      setError(err);
      return;
    }

    await onSave(form);

    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-lg">
        <h2 className="text-lg font-semibold mb-4">
          {form.id ? "Plan Güncelle" : "Yeni Plan"}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600">Plan Adı</label>
            <input
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="border p-2 w-full rounded"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600">Kullanıcı ₺</label>
              <input
                type="number"
                value={form.pricePerUser}
                onChange={(e) =>
                  handleChange("pricePerUser", Number(e.target.value))
                }
                className="border p-2 w-full rounded"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Şube ₺</label>
              <input
                type="number"
                value={form.pricePerBranch}
                onChange={(e) =>
                  handleChange("pricePerBranch", Number(e.target.value))
                }
                className="border p-2 w-full rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600">Min Kullanıcı</label>
              <input
                type="number"
                value={form.minUser ?? ""}
                onChange={(e) =>
                  handleChange(
                    "minUser",
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
                className="border p-2 w-full rounded"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Max Kullanıcı</label>
              <input
                type="number"
                value={form.maxUser ?? ""}
                onChange={(e) =>
                  handleChange(
                    "maxUser",
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
                className="border p-2 w-full rounded"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSubmit}
              className="bg-black text-white px-4 py-2 rounded w-full hover:opacity-90"
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
