"use client";

import { useState } from "react";
import { GroupTag } from "@/types/groupTag";

export default function GroupTagModal({
  open,
  onClose,
  onSave,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
  initial?: GroupTag | null;
}) {
  const [name, setName] = useState(initial?.name ?? "");

  if (!open) return null;

  const handleSubmit = async () => {
    if (!name.trim()) return;

    await onSave(name);

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[400px] rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">
          {initial ? "Grup Etiketi Düzenle" : "Grup Etiketi Oluştur"}
        </h2>

        <input
          className="w-full border rounded p-2 mb-4"
          placeholder="Etiket adı"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            İptal
          </button>

          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}
