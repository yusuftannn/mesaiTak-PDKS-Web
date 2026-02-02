// src/app/(protected)/layout.tsx
"use client";

import { useAuthBootstrap } from "@/lib/auth/useAuth";
import { useAuthStore } from "@/lib/auth/auth.store";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import AppShell from "@/components/AppShell";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useAuthBootstrap();
  const router = useRouter();
  const pathname = usePathname();
  const { user, initializing } = useAuthStore();

  useEffect(() => {
    if (initializing) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    // Web panel sadece manager
    if (user.role !== "manager") {
      router.replace("/login?forbidden=1");
      return;
    }
  }, [user, initializing, router, pathname]);

  if (initializing) return <div className="p-6">Yükleniyor…</div>;
  if (!user || user.role !== "manager") return null;

  return <AppShell>{children}</AppShell>;
}
