"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  Package,
  Users,
} from "lucide-react";
import Image from "next/image";

const nav = [
  {
    href: "/manager/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/manager/companies",
    label: "Şirketler",
    icon: Building2,
  },
  {
    href: "/manager/plans",
    label: "Planlar",
    icon: Package,
  },
  {
    href: "/manager/subscriptions",
    label: "Abonelikler",
    icon: CreditCard,
  },
  {
    href: "/manager/users",
    label: "Kullanıcılar",
    icon: Users,
  },
];

export default function ManagerSidebar() {
  const path = usePathname();

  return (
    <aside className="w-64 border-r border-border bg-white/72 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--palette-secondary)_0%,var(--palette-text-primary)_45%,var(--palette-primary)_100%)] text-white shadow-[0_18px_34px_-20px_rgba(20,184,166,0.9)]">
          <Image
            src="/img/logo.png"
            alt="MesaiTak Logo"
            width={44}
            height={44}
            className="w-full rounded-2xl object-cover"
          />
        </div>
        <div>
          <div className="text-lg font-semibold tracking-tight text-secondary">
            MesaiTak
          </div>
          <div className="text-xs font-medium uppercase tracking-[0.22em] text-text-secondary">
            ADMIN PANEL
          </div>
        </div>
      </div>
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
                  ? "bg-primary text-white"
                  : "text-text-primary hover:bg-primary/10"
              }`}
            >
              <Icon size={18} />
              {x.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
