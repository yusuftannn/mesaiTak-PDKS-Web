"use client";

import { Clock } from "lucide-react";
import type { DashboardUser } from "@/features/dashboard/dashboard.types";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function UserRow({ user }: { user: DashboardUser }) {
  const hasShift = user.shiftStart && user.shiftEnd;

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-linear-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center text-xs font-semibold shadow-sm">
          {getInitials(user.name)}
        </div>

        <div className="flex flex-col leading-tight">
          <span className="text-sm font-medium text-gray-800">{user.name}</span>

          {hasShift && (
            <span className="text-[11px] text-gray-400">Vardiya</span>
          )}
        </div>
      </div>

      {hasShift ? (
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full shadow-sm">
          <Clock size={14} className="text-gray-400" />

          <span className="text-xs font-medium text-gray-700 tracking-tight">
            {formatShift(user.shiftStart!, user.shiftEnd!)}
          </span>
        </div>
      ) : (
        <span className="text-xs text-gray-400 italic">Vardiya yok</span>
      )}
    </div>
  );
}

function formatShift(start: string, end: string) {
  return `${start} – ${end}`; 
}
