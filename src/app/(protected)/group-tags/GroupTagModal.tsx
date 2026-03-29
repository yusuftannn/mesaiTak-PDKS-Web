"use client";

import { useState, useEffect } from "react";
import { GroupTag } from "@/features/group-tags/group-tags.types";
import Button from "@/components/ui/Button";

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(initial?.name ?? "");
  }, [initial]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!name.trim()) return;

    try {
      setLoading(true);
      await onSave(name);
      onClose();
    } finally {
      setLoading(false);
    }
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
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            İptal
          </Button>

          <Button
            onClick={handleSubmit}
            loading={loading}
          >
            Kaydet
          </Button>
        </div>
      </div>
    </div>
  );
}
