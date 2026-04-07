"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import dynamic from "next/dynamic";

const MapPicker = dynamic(() => import("./MapPicker"), {
  ssr: false,
});

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (lat: number, lng: number) => void;
};

export default function MapModal({ open, onClose, onSave }: Props) {
  const [tempLocation, setTempLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const [search, setSearch] = useState("");

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 300);
    }
  }, [open]);

  async function searchLocation() {
    if (!search.trim()) return;

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        search,
      )}`,
    );

    const data = await res.json();

    if (data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);

      setTempLocation({ lat, lng });

      window.dispatchEvent(
        new CustomEvent("map:move", { detail: { lat, lng } }),
      );
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-xl w-[90vw] max-w-225 p-4 space-y-4">
        <h3 className="font-semibold text-lg">Konum Seç</h3>

        <div className="flex gap-2">
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm"
            placeholder="Adres ara (örn: Kadıköy İstanbul)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") searchLocation();
            }}
          />

          <Button onClick={searchLocation}>Ara</Button>
        </div>

        <div className="w-full h-100 rounded-lg overflow-hidden">
          <MapPicker
            value={tempLocation}
            onSelect={(lat, lng) => setTempLocation({ lat, lng })}
          />
        </div>

        {tempLocation && (
          <div className="text-xs text-green-600">
            Seçilen: {tempLocation.lat.toFixed(5)},{" "}
            {tempLocation.lng.toFixed(5)}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            İptal
          </Button>

          <Button
            onClick={() => {
              if (!tempLocation) return;
              onSave(tempLocation.lat, tempLocation.lng);
              onClose();
            }}
          >
            Kaydet
          </Button>
        </div>
      </div>
    </div>
  );
}
