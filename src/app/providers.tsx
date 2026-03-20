"use client";

import { useAuthBootstrap } from "@/features/auth/useAuth";
import { useAuthStore } from "@/features/auth/auth.store";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  useAuthBootstrap();

  const { user, initializing } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (initializing) return;

    if (!user) {
      if (pathname !== "/login") {
        router.replace("/login");
      }
      return;
    }

    if (pathname === "/login" || pathname === "/") {
      if (user.role === "manager") {
        router.replace("/manager/dashboard");
      } else if (user.role === "admin") {
        router.replace("/dashboard");
      }
    }
  }, [user, initializing, pathname, router]);

  if (initializing) {
    return <div className="p-6">Yükleniyor...</div>;
  }

  return <>{children}</>;
}
