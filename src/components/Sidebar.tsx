"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
  LayoutDashboard,
  Building2,
  MapPin,
  Users,
  Clock,
  CalendarCheck,
  FileText,
  Calendar,
  ClipboardList,
  ChevronDown,
  ChevronUp,
  Map,
  List,
} from "lucide-react";
import Button from "./ui/Button";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/companies", label: "Şirketler", icon: Building2 },
  { href: "/branches", label: "Şubeler", icon: MapPin },
  { href: "/users", label: "Kullanıcılar", icon: Users },
  { href: "/shifts", label: "Vardiya", icon: Clock },
  { href: "/leaves", label: "İzin Talepleri", icon: CalendarCheck },
];

const reportItems = [
  { href: "/reports/monthly", label: "Aylık Rapor", icon: Calendar },
  { href: "/reports/puantaj", label: "Detaylı Puantaj", icon: ClipboardList },
];

const locationItems = [
  { href: "/locations/map", label: "Harita Görünümü", icon: Map },
  { href: "/locations/list", label: "Liste Görünümü", icon: List },
];

export default function Sidebar() {
  const path = usePathname();
  const [manualOpen, setManualOpen] = useState(false);
  const [manualOpenLocations, setManualOpenLocations] = useState(false);

  const isReportRoute = path.startsWith("/reports");
  const openReports = isReportRoute || manualOpen;

  const isLocationsRoute = path.startsWith("/locations");
  const openLocations = isLocationsRoute || manualOpenLocations;

  return (
    <aside className="w-64 border-r p-4">
      <div className="font-semibold text-lg">MesaiTak</div>
      <div className="text-xs text-gray-500">Manager Panel</div>

      <nav className="mt-6 space-y-1">
        {nav.map((x) => {
          const active = path.startsWith(x.href);
          const Icon = x.icon;

          return (
            <Link
              key={x.href}
              href={x.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition ${
                active
                  ? "bg-black text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Icon size={18} />
              {x.label}
            </Link>
          );
        })}

        <div>
          <Button
            variant={isLocationsRoute ? "primary" : "ghost"}
            size="nav"
            fullWidth
            justify="between"
            onClick={() => setManualOpenLocations((v) => !v)}
          >
            <div className="flex items-center gap-3">
              <MapPin size={18} />
              Konumlar
            </div>

            {openLocations ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </Button>

          {openLocations && (
            <div className="ml-4 mt-1 space-y-1">
              {locationItems.map((r) => {
                const active = path === r.href;
                const Icon = r.icon;

                return (
                  <Link
                    key={r.href}
                    href={r.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                      active
                        ? "bg-black text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon size={16} />
                    {r.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <Button
            variant={isReportRoute ? "primary" : "ghost"}
            size="nav"
            fullWidth
            justify="between"
            onClick={() => setManualOpen(!manualOpen)}
          >
            <div className="flex items-center gap-3">
              <FileText size={18} />
              Raporlar
            </div>

            {openReports ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Button>

          {openReports && (
            <div className="ml-4 mt-1 space-y-1">
              {reportItems.map((r) => {
                const active = path === r.href;
                const Icon = r.icon;

                return (
                  <Link
                    key={r.href}
                    href={r.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                      active
                        ? "bg-black text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon size={16} />
                    {r.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
}
