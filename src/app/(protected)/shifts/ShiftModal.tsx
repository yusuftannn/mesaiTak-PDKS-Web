"use client";

import { useState } from "react";

type Props = {
  open: boolean;
  initial?: {
    startTime: string;
    endTime: string;
  };
  onClose: () => void;
  onSave: (start: string, end: string) => Promise<void>;
  onDelete?: () => Promise<void>;
};

export default function ShiftModal({
  open,
  initial,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const [startTime, setStartTime] = useState(initial?.startTime ?? "09:00");
  const [endTime, setEndTime] = useState(initial?.endTime ?? "18:00");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const submit = async () => {
    setLoading(true);
    await onSave(startTime, endTime);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-sm p-6 space-y-4">
        <h3 className="text-lg font-semibold">Vardiya</h3>

        <div>
          <label className="text-sm">Başlangıç</label>
          <input
            type="time"
            className="border rounded w-full p-2"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm">Bitiş</label>
          <input
            type="time"
            className="border rounded w-full p-2"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>

        <div
          className={`flex items-center pt-2 ${
            onDelete ? "justify-between" : "justify-end"
          }`}
        >
          {onDelete && (
            <button
              onClick={async () => {
                if (!confirm("Vardiya silinsin mi?")) return;
                await onDelete();
                onClose();
              }}
              className="text-red-600 text-sm cursor-pointer hover:underline"
            >
              Sil
            </button>
          )}

          <div className="flex gap-2">
            <button onClick={onClose} className="cursor-pointer">
              İptal
            </button>
            <button
              onClick={submit}
              disabled={loading}
              className="bg-black text-white px-4 py-2 rounded cursor-pointer"
            >
              Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
