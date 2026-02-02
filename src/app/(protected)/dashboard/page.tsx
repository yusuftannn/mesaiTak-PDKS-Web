"use client";

import { useAuthStore } from "@/lib/auth/auth.store";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="p-6 space-y-2">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-gray-600">
        Welcome <b>{user?.email}</b>
      </p>
      <p className="text-sm">
        Role: <b>{user?.role}</b>
      </p>
    </div>
  );
}
