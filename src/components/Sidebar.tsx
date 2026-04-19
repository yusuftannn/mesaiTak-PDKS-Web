"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  AlertTriangle,
  BookOpenText,
  Calendar,
  CalendarCheck,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Clock,
  FileText,
  LayoutDashboard,
  List,
  Map,
  MapPin,
  Sparkles,
  Tags,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import Button from "./ui/Button";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/branches", label: "Şubeler", icon: MapPin },
  { href: "/users", label: "Kullanıcılar", icon: Users },
  { href: "/shifts", label: "Vardiya", icon: Clock },
  { href: "/leaves", label: "İzin Talepleri", icon: CalendarCheck },
  { href: "/suspicious", label: "Şüpheli İşlemler", icon: AlertTriangle },
];

const reportItems = [
  { href: "/reports/monthly", label: "Aylık Rapor", icon: Calendar },
  { href: "/reports/puantaj", label: "Detaylı Puantaj", icon: ClipboardList },
];

const locationItems = [
  { href: "/locations/map", label: "Harita Görünümü", icon: Map },
  { href: "/locations/list", label: "Liste Görünümü", icon: List },
];

const groupTagItems = [
  { href: "/group-tags", label: "Etiket Listesi", icon: Tags },
  { href: "/group-tags/assign", label: "Etiket Ata", icon: UserCheck },
];

type SidebarProps = {
  isOpen?: boolean;
  onClose?: () => void;
};

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const path = usePathname();
  const [manualOpenReports, setManualOpenReports] = useState(false);
  const [manualOpenLocations, setManualOpenLocations] = useState(false);
  const [manualOpenGroupTags, setManualOpenGroupTags] = useState(false);

  const isReportRoute = path.startsWith("/reports");
  const openReports = isReportRoute || manualOpenReports;

  const isLocationsRoute = path.startsWith("/locations");
  const openLocations = isLocationsRoute || manualOpenLocations;

  const isGroupTagRoute = path.startsWith("/group-tags");
  const openGroupTags = isGroupTagRoute || manualOpenGroupTags;

  const linkClass = (active: boolean) =>
    clsx(
      "group flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium transition-colors duration-150",
      active
        ? "bg-slate-950 text-white"
        : "text-slate-600 bg-transparent hover:bg-slate-100",
    );

  const iconClass = (active: boolean) =>
    active
      ? "text-white"
      : "text-slate-400 transition group-hover:text-slate-700";

  return (
    <>
      <div
        className={clsx(
          "fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-[2px] transition-opacity md:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />

      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-40 flex w-73 max-w-[86vw] flex-col border-r border-white/60 bg-white/82 px-4 py-4 shadow-[0_20px_80px_-28px_rgba(15,23,42,0.35)] backdrop-blur-2xl transition-transform duration-300 md:static md:z-auto md:w-70 md:translate-x-0 md:border-r-slate-200/80 md:bg-white/72",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_45%,#0ea5e9_100%)] text-white shadow-[0_18px_34px_-20px_rgba(14,165,233,0.9)]">
                <Sparkles size={18} />
              </div>
              <div>
                <div className="text-lg font-semibold tracking-tight text-slate-950">
                  MesaiTak
                </div>
                <div className="text-xs font-medium uppercase tracking-[0.22em] text-slate-400">
                  ADMIN PANEL
                </div>
              </div>
            </div>

            {/* <div className="mt-4 rounded-2xl border border-sky-100 bg-[linear-gradient(135deg,rgba(14,165,233,0.12),rgba(15,23,42,0.03))] px-4 py-3">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                Kontrol Merkezi
              </div>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Tüm ekip operasyonlarını tek merkezden yönetin ve takip edin.
              </p>
            </div> */}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:text-slate-950 md:hidden"
            aria-label="Menüyü kapat"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="app-scroll mt-6 flex-1 space-y-1.5 overflow-y-auto pr-1">
          {nav.map((item) => {
            const active = path.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={linkClass(active)}
                onClick={onClose}
              >
                <Icon size={18} className={iconClass(active)} />
                {item.label}
              </Link>
            );
          })}

          <div>
            <Button
              variant={isLocationsRoute ? "primary" : "ghost"}
              size="nav"
              fullWidth
              justify="between"
              onClick={() => setManualOpenLocations((value) => !value)}
              className={clsx(
                "rounded-2xl px-3.5 py-3 text-sm font-medium",
                isLocationsRoute
                  ? "bg-slate-950 text-white shadow-[0_18px_40px_-24px_rgba(15,23,42,0.95)]"
                  : "text-slate-600 hover:bg-white/80 hover:text-slate-950",
              )}
            >
              <div className="flex items-center gap-3">
                <MapPin
                  size={18}
                  className={isLocationsRoute ? "text-white" : "text-slate-400"}
                />
                Konumlar
              </div>
              {openLocations ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </Button>

            {openLocations && (
              <div className="ml-3 mt-2 space-y-1 border-l border-slate-200/80 pl-3">
                {locationItems.map((item) => {
                  const active = path === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={linkClass(active)}
                      onClick={onClose}
                    >
                      <Icon size={16} className={iconClass(active)} />
                      {item.label}
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
              onClick={() => setManualOpenReports((value) => !value)}
              className={clsx(
                "rounded-2xl px-3.5 py-3 text-sm font-medium",
                isReportRoute
                  ? "bg-slate-950 text-white shadow-[0_18px_40px_-24px_rgba(15,23,42,0.95)]"
                  : "text-slate-600 hover:bg-white/80 hover:text-slate-950",
              )}
            >
              <div className="flex items-center gap-3">
                <FileText
                  size={18}
                  className={isReportRoute ? "text-white" : "text-slate-400"}
                />
                Raporlar
              </div>
              {openReports ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </Button>

            {openReports && (
              <div className="ml-3 mt-2 space-y-1 border-l border-slate-200/80 pl-3">
                {reportItems.map((item) => {
                  const active = path === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={linkClass(active)}
                      onClick={onClose}
                    >
                      <Icon size={16} className={iconClass(active)} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <Button
              variant={isGroupTagRoute ? "primary" : "ghost"}
              size="nav"
              fullWidth
              justify="between"
              onClick={() => setManualOpenGroupTags((value) => !value)}
              className={clsx(
                "rounded-2xl px-3.5 py-3 text-sm font-medium",
                isGroupTagRoute
                  ? "bg-slate-950 text-white shadow-[0_18px_40px_-24px_rgba(15,23,42,0.95)]"
                  : "text-slate-600 hover:bg-white/80 hover:text-slate-950",
              )}
            >
              <div className="flex items-center gap-3">
                <Tags
                  size={18}
                  className={isGroupTagRoute ? "text-white" : "text-slate-400"}
                />
                Grup Etiketleri
              </div>
              {openGroupTags ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </Button>

            {openGroupTags && (
              <div className="ml-3 mt-2 space-y-1 border-l border-slate-200/80 pl-3">
                {groupTagItems.map((item) => {
                  const active = path === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={linkClass(active)}
                      onClick={onClose}
                    >
                      <Icon size={16} className={iconClass(active)} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-5 border-t border-slate-200/80 pt-5">
            <Link
              href="/guide"
              className={linkClass(path.startsWith("/guide"))}
              onClick={onClose}
            >
              <BookOpenText
                size={18}
                className={iconClass(path.startsWith("/guide"))}
              />
              Kullanım Kılavuzu
            </Link>
          </div>
        </nav>
      </aside>
    </>
  );
}
