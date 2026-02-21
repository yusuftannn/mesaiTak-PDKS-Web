"use client";

import { useState } from "react";
import { SHIFT_TYPES, ShiftType } from "@/lib/db/constants/shiftTypes";
import Button from "@/components/ui/Button";
type ShiftInitial = {
  startTime: string;
  endTime: string;
  type: ShiftType;
};

type Props = {
  open: boolean;
  initial?: ShiftInitial;
  onClose: () => void;
  onSave: (start: string, end: string, type: ShiftType) => Promise<void>;
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
  const [type, setType] = useState<ShiftType>(initial?.type ?? "normal");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const submit = async () => {
    setLoading(true);
    await onSave(startTime, endTime, type);
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

        <div className="space-y-1">
          <label className="text-sm text-gray-600">Vardiya Türü</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as ShiftType)}
            className="w-full border rounded px-3 py-2"
          >
            {SHIFT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div
          className={`flex items-center pt-2 ${
            onDelete ? "justify-between" : "justify-end"
          }`}
        >
          {onDelete && (
            <Button
              variant="danger"
              size="sm"
              onClick={async () => {
                if (!confirm("Vardiya silinsin mi?")) return;
                await onDelete();
                onClose();
              }}
            >
              Sil
            </Button>
          )}

          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              İptal
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={submit}
              loading={loading}
            >
              Kaydet
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
