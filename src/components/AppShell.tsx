"use client";

import { useAuthStore } from "@/features/auth/auth.store";
import Sidebar from "./Sidebar";
import ManagerSidebar from "./ManagerSidebar";
import Topbar from "./Topbar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();

  const isManager = user?.role === "manager";

  return (
    <div className="h-screen flex overflow-hidden">
      {/* SIDEBAR */}
      {isManager ? <ManagerSidebar /> : <Sidebar />}

      {/* CONTENT */}
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />

        <main className="flex-1 overflow-y-auto p-2">{children}</main>
      </div>
    </div>
  );
}
