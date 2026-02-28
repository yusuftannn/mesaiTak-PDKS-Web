"use client";

import React from "react";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";
import { AttendanceWithLocation } from "@/lib/db/attendance";

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (!points.length) return;

    const bounds = L.latLngBounds(
      points.map(([lat, lng]) => L.latLng(lat, lng)),
    );

    map.fitBounds(bounds, { padding: [30, 30] });
  }, [points, map]);

  return null;
}

const startIcon = new L.DivIcon({
  html: `<div style="width:14px;height:14px;border-radius:999px;background:#16a34a;border:2px solid white;"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const endIcon = new L.DivIcon({
  html: `<div style="width:14px;height:14px;border-radius:999px;background:#dc2626;border:2px solid white;"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

export default function AttendanceMap({
  data,
}: {
  data: AttendanceWithLocation[];
}) {
  const points: [number, number][] = [];

  data.forEach((item) => {
    if (item.checkInLocation)
      points.push([item.checkInLocation.lat, item.checkInLocation.lng]);

    if (item.checkOutLocation)
      points.push([item.checkOutLocation.lat, item.checkOutLocation.lng]);
  });

  const center: [number, number] =
    points.length > 0 ? points[0] : [41.0082, 28.9784];

  return (
    <div className="h-[600px] w-full rounded-2xl overflow-hidden border">
      <MapContainer center={center} zoom={12} className="h-full w-full">
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds points={points} />

        {data.flatMap((item) => {
          const elements: React.ReactElement[] = [];

          const polyPoints: [number, number][] = [];

          if (item.checkInLocation) {
            polyPoints.push([
              item.checkInLocation.lat,
              item.checkInLocation.lng,
            ]);

            elements.push(
              <Marker
                key={item.id + "_in"}
                position={[item.checkInLocation.lat, item.checkInLocation.lng]}
                icon={startIcon}
              >
                <Popup>
                  <b>{item.userName}</b>
                  <br />
                  🟢 Mesai Başlangıç
                  <br />
                  {item.checkInAt?.toLocaleString("tr-TR")}
                </Popup>
              </Marker>,
            );
          }

          if (item.checkOutLocation) {
            polyPoints.push([
              item.checkOutLocation.lat,
              item.checkOutLocation.lng,
            ]);

            elements.push(
              <Marker
                key={item.id + "_out"}
                position={[
                  item.checkOutLocation.lat,
                  item.checkOutLocation.lng,
                ]}
                icon={endIcon}
              >
                <Popup>
                  <b>{item.userName}</b>
                  <br />
                  🔴 Mesai Bitiş
                  <br />
                  {item.checkOutAt?.toLocaleString("tr-TR")}
                </Popup>
              </Marker>,
            );
          }

          if (polyPoints.length === 2) {
            elements.push(
              <Polyline key={item.id + "_line"} positions={polyPoints} />,
            );
          }

          return elements;
        })}
      </MapContainer>
    </div>
  );
}
