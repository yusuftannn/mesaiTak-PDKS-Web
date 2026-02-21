"use client";

import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/lib/auth/auth.store";
import { LogOut } from "lucide-react";
import Button from "@/components/ui/Button";

export default function Topbar() {
  const user = useAuthStore((s) => s.user);

  const handleLogout = async () => {
    if (!confirm("Çıkış yapmak istediğinize emin misiniz?")) return;
    await auth.signOut();
  };

  return (
    <header className="border-b p-4 flex items-center justify-between">
      <div className="text-sm text-gray-600">
        Merhaba <b>{user?.name}</b>
      </div>
      <Button
        variant="danger"
        size="md"
        onClick={handleLogout}
        icon={<LogOut size={16} />}
        className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
      >
        Çıkış
      </Button>
    </header>
  );
}
