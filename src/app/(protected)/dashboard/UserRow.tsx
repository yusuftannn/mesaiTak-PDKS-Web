"use client";

import type { DashboardUser } from "@/lib/db/dashboard";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export default function UserRow({ user }: { user: DashboardUser }) {
  const shiftText =
    user.shiftStart && user.shiftEnd
      ? `${user.shiftStart} - ${user.shiftEnd}`
      : "-";

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-semibold">
          {getInitials(user.name)}
        </div>
        <div className="text-xs font-medium text-gray-800">{user.name}</div>
      </div>

      <div className="text-xs text-gray-600 font-medium">{shiftText}</div>
    </div>
  );
}
