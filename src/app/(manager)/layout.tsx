"use client";

import { useAuthStore } from "@/features/auth/auth.store";
import AppShell from "@/components/AppShell";

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthStore();

  if (!user || user.role !== "manager") return null;

  return <AppShell>{children}</AppShell>;
}

