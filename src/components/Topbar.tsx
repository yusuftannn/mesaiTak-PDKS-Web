"use client";

import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/lib/auth/auth.store";

export default function Topbar() {
  const user = useAuthStore((s) => s.user);

  return (
    <header className="border-b p-4 flex items-center justify-between">
      <div className="text-sm text-gray-600">
        {user?.email} • <b>{user?.role}</b>
      </div>
      <button className="text-sm cursor-pointer" onClick={() => auth.signOut()}>
        Çıkış
      </button>
    </header>
  );
}
