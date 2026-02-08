"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/companies", label: "Şirketler" },
  { href: "/branches", label: "Şubeler" },
  { href: "/users", label: "Kullanıcılar" },
  { href: "/shifts", label: "Vardiya" },
  { href: "/leaves", label: "İzin Talepleri" },
];

export default function Sidebar() {
  const path = usePathname();

  return (
    <aside className="w-64 border-r p-4">
      <div className="font-semibold">MesaiTak</div>
      <div className="text-xs text-gray-500">Manager Panel</div>

      <nav className="mt-6 space-y-1">
        {nav.map((x) => {
          const active = path.startsWith(x.href);
          return (
            <Link
              key={x.href}
              href={x.href}
              className={`block rounded-lg px-3 py-2 ${
                active ? "bg-black text-white" : "hover:bg-gray-100"
              }`}
            >
              {x.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
