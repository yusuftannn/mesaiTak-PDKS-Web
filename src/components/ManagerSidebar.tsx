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
      </nav>
    </aside>
  );
}
