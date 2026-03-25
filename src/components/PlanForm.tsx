"use client";

import { useState } from "react";
import { upsertPlan } from "@/features/plans/plans.service";
import { PlanId } from "@/features/plans/plans.types";

export default function PlanForm() {
  const [id, setId] = useState<PlanId>("FREE");
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [userLimit, setUserLimit] = useState(1);
  const [features, setFeatures] = useState("");

  const handleSubmit = async () => {
    await upsertPlan({
      id,
      name,
      price,
      userLimit,
      features: features.split(",").map((f) => f.trim()),
    });

    alert("Kaydedildi");
  };

  return (
    <div className="p-4 border rounded-xl mt-6">
      <h2 className="font-semibold mb-4">Plan Ekle / Güncelle</h2>

      <select onChange={(e) => setId(e.target.value as PlanId)}>
        <option value="FREE">FREE</option>
        <option value="PRO">PRO</option>
        <option value="ENTERPRISE">ENTERPRISE</option>
      </select>

      <input
        placeholder="Plan adı"
        onChange={(e) => setName(e.target.value)}
        className="block mt-2 border p-2"
      />

      <input
        type="number"
        placeholder="Fiyat"
        onChange={(e) => setPrice(Number(e.target.value))}
        className="block mt-2 border p-2"
      />

      <input
        type="number"
        placeholder="User limit"
        onChange={(e) => setUserLimit(Number(e.target.value))}
        className="block mt-2 border p-2"
      />

      <input
        placeholder="Features (virgülle)"
        onChange={(e) => setFeatures(e.target.value)}
        className="block mt-2 border p-2"
      />

      <button
        onClick={handleSubmit}
        className="mt-4 bg-black text-white px-4 py-2 rounded"
      >
        Kaydet
      </button>
    </div>
  );
}
