"use client";

import { useState } from "react";
import { useAuthStore } from "@/features/auth/auth.store";
import Sidebar from "./Sidebar";
import ManagerSidebar from "./ManagerSidebar";
import Topbar from "./Topbar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isManager = user?.role === "manager";

  return (
    <div className="flex h-screen overflow-hidden bg-[radial-gradient(circle_at_top,color-mix(in_srgb,var(--palette-primary)_14%,transparent),transparent_28%),linear-gradient(180deg,var(--palette-background)_0%,color-mix(in_srgb,var(--palette-primary)_8%,var(--palette-background))_100%)]">
      {isManager ? (
        <ManagerSidebar />
      ) : (
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}

      <div className="flex min-w-0 flex-1 flex-col h-screen">
        <Topbar
          onOpenSidebar={!isManager ? () => setSidebarOpen(true) : undefined}
        />

        <main className="app-scroll flex-1 overflow-y-auto px-3 pb-3 pt-2 sm:px-4 sm:pb-4 lg:px-6 lg:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}
