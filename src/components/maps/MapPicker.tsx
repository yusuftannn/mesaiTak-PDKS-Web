"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import { useState, useEffect } from "react";
import L from "leaflet";

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })
  ._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

type Props = {
  value?: { lat: number; lng: number } | null;
  onSelect: (lat: number, lng: number) => void;
};
type MapMoveDetail = {
  lat: number;
  lng: number;
};

function ResizeFix() {
  const map = useMap();

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [map]);

  return null;
}

function MoveMap() {
  const map = useMap();

  useEffect(() => {
    function handler(e: Event) {
      const customEvent = e as CustomEvent<MapMoveDetail>;

      const { lat, lng } = customEvent.detail;

      map.setView([lat, lng], 16);
    }

    window.addEventListener("map:move", handler);

    return () => {
      window.removeEventListener("map:move", handler);
    };
  }, [map]);

  return null;
}

function ClickHandler({ onSelect, value }: Props) {
  const [position, setPosition] = useState<L.LatLng | null>(
    value ? L.latLng(value.lat, value.lng) : null,
  );

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position ? <Marker position={position} /> : null;
}

export default function MapPicker({ onSelect, value }: Props) {
  return (
    <MapContainer
      center={[40.765, 29.94]}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <ResizeFix />
      <MoveMap />
      <ClickHandler onSelect={onSelect} value={value} />
    </MapContainer>
  );
}
